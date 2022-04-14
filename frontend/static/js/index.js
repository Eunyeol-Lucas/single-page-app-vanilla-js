import Dashboard from "./views/Dashboard.js";
import Posts from "./views/Posts.js";
import PostView from "./views/PostView.js";
import Settings from "./views/Settings.js";

// URL 일치 여부를 확인하기 위해 입력받은 URL을 표준 정규식으로 변경"
const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );

  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};
// pushState를 통해 페이지 이동 없이 주소를 변경해줌
const navigateTo = (url) => {
  history.pushState(null, null, url);
  // 변경된 주소를 바탕으로 router 함수를 통해 rendering
  router();
};
const router = async () => {
  const routes = [
    { path: "/", view: Dashboard },
    { path: "/posts", view: Posts },
    { path: "/posts/:id", view: PostView },
    { path: "/settings", view: Settings },
  ];
  // URL 일치 여부 확인
  // Test each route for potential match
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });
  // URL이 일치하는 요소만 선택
  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );
  // 일치하는 URL 타입이 없는 경우 '/' 기본 URL로 이동 -> 404 page로 이동하면 좋을 듯
  if (!match) {
    match = {
      route: routes[0],
      result: [location.pathname],
    };
  }
  // match한 요소의 파라미터를 기반으로 인스터스를 생성
  const view = new match.route.view(getParams(match));
  // id="app" DOM 요소에 인스턴스 렌더링
  document.querySelector("#app").innerHTML = await view.getHtml();
};

window.addEventListener("popstate", router);
// DOM 컨텐트가 로드됐을 떄 이벤트 실행
document.addEventListener("DOMContentLoaded", () => {
  // 이벤트 위임
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(e.target.href);
    }
  });
  // '/'를 바탕으로 렌더링
  router();
});
