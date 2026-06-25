import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.kaoyan.buddy",
  appName: "考研搭子",
  webDir: "out",
  server: {
    cleartext: true,
    allowNavigation: ["*"],
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
