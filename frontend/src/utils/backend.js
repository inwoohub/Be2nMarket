export function getBackendBaseUrl() {
  const fromEnv = process.env.REACT_APP_BACKEND_BASE_URL;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
    return fromEnv.replace(/\/+$/, "");
  }

  const { protocol, hostname, port } = window.location;

  // CRA 개발 서버(기본 3000)에서 실행 중이면 백엔드(기본 8080)로 이동
  if ((hostname === "localhost" || hostname === "127.0.0.1") && port === "3000") {
    return `${protocol}//${hostname}:8080`;
  }

  // 그 외에는 같은 Origin을 기본값으로 사용 (배포 환경에서 리버스 프록시 사용 가정)
  return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
}

