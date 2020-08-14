# expo-ota-manager

<div style="justify-content: center; align-items: center; display: flex; flex-direction: column;margin-bottom: 2em;">
  <img style="width: 150px;margin-bottom: 2em;" src="expo-ota-manager.svg">
  <img style="width: 200px;" src="app-sap.png">
</div>
A helper plugin to manage Over-The-Air updates when your app is running

This library is designed to help keep your Expo application up to date.

The default initialised value for [fallbackToCacheTimeout](https://docs.expo.io/versions/latest/config/app/#fallbacktocachetimeout) is 0s, which means that your app will be on an old JS bundle version until the first full app restart.

When you instantiate this library it will check for new app updates every time your app opens from the background.
If there are any new updates available, it will download them in the background and then prompt the user to restart their app to use the new version.

## Usage

```javascript
import * as React from "react";
import { Text, View, StyleSheet } from "react-native";
import { initialiseOtaManager } from "expo-ota-manager";

export default function App() {
  React.useEffect(
    () =>
      initialiseOtaManager({
        /*options*/
      }),
    []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
        Publish a new OTA update and open app from background to get notified
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
```

## Available props

| Name                      | Type   | Default                              | Description                                                                                                           |
| ------------------------- | ------ | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| noButtonText              | string | "Not now"                            | No button text                                                                                                        |
| yesButtonText             | string | "Restart"                            | Yes button text                                                                                                       |
| titleText                 | string | "A new version is available"         | Title text                                                                                                            |
| textLine1                 | string | "Restart your app to start using it" | Text line 1                                                                                                           |
| textLine2                 | string | "New Version"                        | Text line 2                                                                                                           |
| repromptIntervalMs        | number | hourInMS                             | How often to remind a user to restart for an update                                                                   |
| foregroundCheckIntervalMs | number | 0 (don't run)                        | Time interval for an additional check that runs constantly - if you are concerned about app not going into background |
