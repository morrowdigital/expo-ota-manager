import * as Updates from "expo-updates";
import { Alert, AppState, AppStateStatus } from "react-native";

export const showConfirmAlert = async (
  title: string,
  message?: string,
  confirmText = "Confirm",
  cancelText = "Cancel"
) =>
  new Promise<boolean>((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: confirmText, onPress: () => resolve(true) },
        { text: cancelText, onPress: () => resolve(false), style: "cancel" },
      ],
      { onDismiss: () => resolve(false) }
    );
  });

export default class OtaManager {
  private lastPrompt: Date | null = null;
  private lastAppState: string = "background";

  constructor() {
    AppState.addEventListener("change", this.handleAppStateChange);
    setInterval(this.checkForNewAppVersion, 10000);
  }

  public handleNewBundle = async (manifest: Updates.Manifest) => {
    const hourInMS = 1000 * 60 * 60;
    if (
      this.lastPrompt &&
      new Date().getTime() - this.lastPrompt.getTime() < hourInMS
    ) {
      return;
    }

    const restartConfirm = await showConfirmAlert(
      "New Version",
      `${manifest?.version} is now available.
          \nRestart your app to start using it.`,
      "Restart",
      "Not now"
    );

    this.lastPrompt = new Date();

    if (restartConfirm) {
      Updates.reloadAsync();
    }
  };

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.lastAppState.match(/background/) && nextAppState === "active") {
      this.checkForNewAppVersion();
    }
    this.lastAppState = nextAppState;
  };

  private checkForNewAppVersion = async () => {
    const { isAvailable } = (await Updates.checkForUpdateAsync()) || {};
    console.log("isAvailable", isAvailable);

    if (isAvailable) {
      const { isNew, manifest } = (await Updates.fetchUpdateAsync()) as {
        isNew: true;
        manifest: Updates.Manifest;
      };
      if (isNew) {
        this.handleNewBundle(manifest);
      }
    }
  };
}

export const initialiseOtaManager = () => {
  new OtaManager();
};
