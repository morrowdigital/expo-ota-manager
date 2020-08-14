import Updates from "expo-updates";
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
  private lastAppState: AppStateStatus = "background";
  private options: IOptions;

  constructor(options: Partial<IOptions>) {
    const hourInMS = 1000 * 60 * 60;

    const defaultOptions: IOptions = {
      noButtonText: "Not now",
      yesButtonText: "Restart",
      textLines: ["An update is ready", "Restart your app to start using it"],
      titleText: "New Version",
      repromptIntervalMs: hourInMS,
      foregroundCheckIntervalMs: 0,
    };

    this.options = { ...defaultOptions, ...options };

    AppState.addEventListener("change", this.handleAppStateChange);

    const { foregroundCheckIntervalMs } = this.options;
    if (foregroundCheckIntervalMs > 0) {
      setInterval(this.checkForNewAppVersion, foregroundCheckIntervalMs);
    }
  }

  private handleNewBundle = async () => {
    if (
      this.lastPrompt &&
      new Date().getTime() - this.lastPrompt.getTime() <
        this.options.repromptIntervalMs
    ) {
      return;
    }

    const restartConfirm = await showConfirmAlert(
      this.options.titleText,
      this.options.textLines.join("\n"),
      this.options.yesButtonText,
      this.options.noButtonText
    );

    this.lastPrompt = new Date();

    if (restartConfirm) {
      Updates.reloadAsync();
    }
  };

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (this.lastAppState === "background" && nextAppState === "active") {
      this.checkForNewAppVersion();
    }
    this.lastAppState = nextAppState;
  };

  private checkForNewAppVersion = async () => {
    const { isAvailable } = await Updates.checkForUpdateAsync();

    if (isAvailable) {
      const { isNew } = await Updates.fetchUpdateAsync();
      if (isNew) {
        this.handleNewBundle();
      }
    }
  };
}

export const initialiseOtaManager = (options: Partial<IOptions>) => {
  new OtaManager(options);
};
