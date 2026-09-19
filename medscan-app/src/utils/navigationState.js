// Screen params may contain health information. Keep them in navigation memory,
// never serialize them into web URLs, browser history or referrer headers.
export function publicNavigationState(state) {
  return {
    ...state,
    routes: state.routes.map(({ params, state: nestedState, ...route }) => ({
      ...route,
      ...(nestedState ? { state: publicNavigationState(nestedState) } : {})
    }))
  };
}
