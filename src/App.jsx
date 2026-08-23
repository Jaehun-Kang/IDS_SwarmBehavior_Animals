import { useEffect, useState } from "react";
import "./styles/App.css";
import Home from "./pages/Home.jsx";
import Sim from "./pages/Sim.jsx";
import Detail from "./pages/Detail.jsx";
import { animals } from "./behaviors/animalData";

const DETAIL_ENTER_DURATION = 400;
const INACTIVITY_TIMEOUT_MS = 6000000;

const ANIMAL_IDS = new Set(animals.map((animal) => animal.id));
const animalIdToSlug = (animalId) => animalId?.replace(/_/g, "-") ?? "";
const animalSlugToId = (slug) => slug?.replace(/-/g, "_") ?? "";
const normalizeBasePath = (baseUrl) => {
  const trimmedBase = (baseUrl || "/").replace(/\/+$/, "");
  return trimmedBase === "" ? "" : trimmedBase;
};
const APP_BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL);

function getAppPathname() {
  const { pathname } = window.location;

  if (
    APP_BASE_PATH &&
    (pathname === APP_BASE_PATH || pathname.startsWith(`${APP_BASE_PATH}/`))
  ) {
    return pathname.slice(APP_BASE_PATH.length) || "/";
  }

  return pathname;
}

function withAppBase(path) {
  if (!APP_BASE_PATH) {
    return path;
  }

  return path === "/" ? `${APP_BASE_PATH}/` : `${APP_BASE_PATH}${path}`;
}

function getRouteState() {
  const pathParts = getAppPathname()
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);

  if (pathParts.length === 0) {
    return { currentPage: "home", selectedAnimal: null };
  }

  const animalId = animalSlugToId(decodeURIComponent(pathParts[0]));
  if (!ANIMAL_IDS.has(animalId)) {
    return { currentPage: "home", selectedAnimal: null, shouldReplace: true };
  }

  return {
    currentPage: pathParts[1] === "detail" ? "detail" : "sim",
    selectedAnimal: animalId,
  };
}

function buildRoutePath(page, animalId) {
  if (page === "home" || !animalId) {
    return "/";
  }

  const animalPath = `/${animalIdToSlug(animalId)}`;
  return page === "detail" ? `${animalPath}/detail` : animalPath;
}

function navigateRoute(page, animalId, { replace = false } = {}) {
  const nextPath = withAppBase(buildRoutePath(page, animalId));
  if (window.location.pathname === nextPath) {
    return;
  }

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ page, animalId }, "", nextPath);
}

function App() {
  const initialRoute = getRouteState();
  const [selectedAnimal, setSelectedAnimal] = useState(
    initialRoute.selectedAnimal,
  );
  const [currentPage, setCurrentPage] = useState(initialRoute.currentPage); // home | sim | detail
  const [savedPosition, setSavedPosition] = useState(null);
  const [isPaused, setIsPaused] = useState(initialRoute.currentPage === "detail");

  useEffect(() => {
    if (initialRoute.shouldReplace) {
      navigateRoute("home", null, { replace: true });
    } else {
      navigateRoute(initialRoute.currentPage, initialRoute.selectedAnimal, {
        replace: true,
      });
    }

    const handlePopState = () => {
      const route = getRouteState();
      setSelectedAnimal(route.selectedAnimal);
      setCurrentPage(route.currentPage);
      setIsPaused(route.currentPage === "detail");

      if (route.shouldReplace) {
        navigateRoute("home", null, { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    let timeoutId;

    const resetInactivityTimeout = () => {
      window.clearTimeout(timeoutId);

      if (currentPage === "home") {
        return;
      }

      timeoutId = window.setTimeout(() => {
        setIsPaused(false);
        setCurrentPage("home");
        setSelectedAnimal(null);
        navigateRoute("home", null);
      }, INACTIVITY_TIMEOUT_MS);
    };

    const activityEvents = [
      "pointerdown",
      "pointermove",
      "keydown",
      "wheel",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimeout, {
        passive: true,
      });
    });

    resetInactivityTimeout();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimeout);
      });
    };
  }, [currentPage]);

  function onAnimalClick(e) {
    const animalId = e.currentTarget.dataset.speciesId || e.currentTarget.id;
    const instanceId = e.currentTarget.id;
    const el = e.currentTarget;

    // 현재 위치 저장
    const position = {
      x: parseFloat(el.style.left) || 0,
      y: parseFloat(el.style.top) || 0,
    };

    setSavedPosition({ animalId, instanceId, position });
    setSelectedAnimal(animalId);
    setCurrentPage("sim");
    setIsPaused(false);
    navigateRoute("sim", animalId);
  }

  function onSimBackClick() {
    setCurrentPage("home");
    setSelectedAnimal(null);
    navigateRoute("home", null);
  }

  function onSimDetailClick() {
    setIsPaused(true);
    setCurrentPage("detail");
    navigateRoute("detail", selectedAnimal);
  }

  function onDetailBackClick() {
    setIsPaused(false);
    setCurrentPage("sim");
    navigateRoute("sim", selectedAnimal);
  }

  function onDetailEnterComplete() {
    setIsPaused(true);
  }

  function onSimAnimalSelect(animalId) {
    setSelectedAnimal(animalId);
    setCurrentPage("sim");
    setIsPaused(false);
    navigateRoute("sim", animalId);
  }

  return (
    <div className="app">
      {currentPage === "home" && (
        <Home onAnimalClick={onAnimalClick} savedPosition={savedPosition} />
      )}
      {(currentPage === "sim" || currentPage === "detail") && (
        <Sim
          selectedAnimal={selectedAnimal}
          onBackClick={onSimBackClick}
          onAnimalSelect={onSimAnimalSelect}
          isPaused={isPaused}
        />
      )}
      {(currentPage === "sim" || currentPage === "detail") && selectedAnimal && (
        <Detail
          animalId={selectedAnimal}
          enterDuration={DETAIL_ENTER_DURATION}
          isOpen={currentPage === "detail"}
          onOpen={onSimDetailClick}
          onBackClick={onDetailBackClick}
          onEnterComplete={onDetailEnterComplete}
        />
      )}
    </div>
  );
}

export default App;
