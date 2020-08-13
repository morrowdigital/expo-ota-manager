import * as Updates from "expo-updates";
import { Alert, AppState, AppStateStatus } from "react-native";
import { IOptions } from "./IOptions";

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
  private options: IOptions;

  constructor(options: Partial<IOptions>) {
    AppState.addEventListener("change", this.handleAppStateChange);
    setInterval(this.checkForNewAppVersion, 10000);

    const defaultOptions: IOptions = {
      noButtonText: "Not now",
      yesButtonText: "Restart",
      textLine1: "A new version is available",
      textLine2: "Restart your app to start using it",
      titleText: "New Version",
    };

    this.options = { ...defaultOptions, ...options };
  }

  public handleNewBundle = async () => {
    const hourInMS = 1000 * 60 * 60;
    if (
      this.lastPrompt &&
      new Date().getTime() - this.lastPrompt.getTime() < hourInMS
    ) {
      return;
    }

    const restartConfirm = await showConfirmAlert(
      this.options.titleText,
      `${this.options.textLine1}\n${this.options.textLine2}`,
      this.options.yesButtonText,
      this.options.noButtonText
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

    if (isAvailable) {
      const { isNew } = (await Updates.fetchUpdateAsync()) as {
        isNew: true;
        manifest: Updates.Manifest;
      };
      if (isNew) {
        this.handleNewBundle();
      }
    }
  };
}

export const initialiseOtaManager = (options: Partial<IOptions>) => {
  new OtaManager(options);
};
