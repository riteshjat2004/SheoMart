export interface DeviceInfo {
  device: "Desktop" | "Mobile" | "Tablet";
  browser: string;
  os: string;
}

export function parseDevice(userAgent = ""): DeviceInfo {
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  let device: "Desktop" | "Mobile" | "Tablet" = "Desktop";

  const ua = userAgent.toLowerCase();

  // Device classification
  if (/mobile|android(?!.*tablet)|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet|ipad|playbook|silk|android(?!.*mobile)/i.test(ua)) {
    device = "Tablet";
  }

  // Browser detection
  if (/edg/i.test(ua)) browser = "Edge";
  else if (/postman/i.test(ua)) browser = "Postman";
  else if (/chrome|crios/i.test(ua) && !/edg|opr/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = "Safari";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/curl/i.test(ua)) browser = "cURL";

  // OS detection
  if (/windows/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}
