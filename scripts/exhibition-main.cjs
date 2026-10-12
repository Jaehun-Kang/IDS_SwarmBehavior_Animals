const { app, BrowserWindow, Menu, dialog, nativeImage } = require("electron");
const { join } = require("node:path");
const { exhibitionKeyAction, isExhibitionUrl } = require("./exhibition-policy.cjs");
const { createExitHold } = require("./exhibition-exit-hold.cjs");

app.setName("SwarmBehavior");
if (process.platform === "win32") app.setAppUserModelId("com.swarmbehavior.animals");
app.setPath("userData", join(app.getPath("appData"), "SwarmBehavior-Animals", "Electron"));
app.commandLine.appendSwitch("enable-features", "CanvasDrawElement");

let window;
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (window) { if (window.isMinimized()) window.restore(); window.focus(); }
  });
  app.on("window-all-closed", () => app.quit());
  app.whenReady().then(async () => {
    const startUrl = process.env.SWARM_EXHIBITION_URL;
    const url = new URL(startUrl);
    if (url.protocol !== "http:" || url.hostname !== "127.0.0.1" ||
        url.pathname !== "/IDS_SwarmBehavior_Animals/" || url.username || url.password) {
      throw new Error("Invalid local exhibition URL. Run npm run sb.");
    }
    Menu.setApplicationMenu(null);
    const icon = nativeImage.createFromDataURL(require("./exhibition-icon.cjs"));
    if (process.platform === "darwin") app.dock.setIcon(icon);
    window = new BrowserWindow({
      icon,
      title: "군집행동", show: false, kiosk: true, fullscreen: true,
      autoHideMenuBar: true, backgroundColor: "#ffffff",
      webPreferences: {
        devTools: false, nodeIntegration: false, contextIsolation: true, sandbox: true,
      },
    });
    window.setMenu(null);
    let confirmingExit = false;
    const confirmExit = async () => {
      if (confirmingExit || window.isDestroyed() || !window.isFocused() ||
          !isExhibitionUrl(window.webContents.getURL(), startUrl)) return;
      confirmingExit = true;
      try {
        const { response } = await dialog.showMessageBox(window, {
          type: "question", title: "군집행동 종료",
          message: "작품을 종료할까요?", detail: "계속 관람하려면 취소를 선택하세요.",
          buttons: ["취소", "종료"], defaultId: 0, cancelId: 0, noLink: true,
        });
        if (response === 1) app.quit();
      } catch (error) {
        console.error("Exit confirmation failed:", error.message);
      } finally {
        confirmingExit = false;
      }
    };
    const exitHold = createExitHold({ confirm: confirmExit });
    window.webContents.on("before-mouse-event", (event, input) => {
      if (confirmingExit || !window.isFocused()) { exitHold.reset(); return; }
      if (exitHold.input(input, window.getContentSize()[1])) event.preventDefault();
    });
    for (const event of ["blur", "hide", "minimize", "resize"]) window.on(event, exitHold.reset);
    window.webContents.on("did-start-navigation", exitHold.reset);
    window.once("closed", exitHold.dispose);
    window.webContents.on("before-input-event", (event, input) => {
      const action = exhibitionKeyAction(input);
      if (action === "allow") return;
      event.preventDefault();
      if (action === "quit" && input.type === "keyDown") app.quit();
    });
    window.webContents.on("context-menu", event => event.preventDefault());
    window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    const guardNavigation = (event, target) => {
      if (!isExhibitionUrl(target, startUrl)) event.preventDefault();
    };
    window.webContents.on("will-navigate", guardNavigation);
    window.webContents.on("will-redirect", guardNavigation);
    window.webContents.session.on("will-download", event => event.preventDefault());
    window.webContents.on("render-process-gone", (_event, details) => {
      console.error(`Exhibition renderer stopped: ${details.reason}`);
      app.exit(1);
    });
    await window.loadURL(startUrl);
    window.show();
    window.focus();
  }).catch(error => {
    dialog.showErrorBox("군집행동 실행 오류", error.message);
    app.exit(1);
  });
}
