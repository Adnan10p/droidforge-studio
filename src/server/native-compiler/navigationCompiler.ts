import { AndroidScreen, LogicAction } from "../../types";

export class NavigationCompiler {
  // Generate multi-screen management and navigation helper methods
  public generateNavigationMethods(): string {
    return `
    // [NavigationCompiler] Multi-Screen Navigation Controller
    public void navigateToScreen(final String targetScreen) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                View targetView = screensMap.get(targetScreen);
                if (targetView == null) {
                    // Try case-insensitive matching
                    for (Map.Entry<String, View> entry : screensMap.entrySet()) {
                        if (entry.getKey().equalsIgnoreCase(targetScreen)) {
                            targetView = entry.getValue();
                            break;
                        }
                    }
                }
                if (targetView != null) {
                    for (View sv : screensMap.values()) {
                        sv.setVisibility(View.GONE);
                    }
                    targetView.setVisibility(View.VISIBLE);
                    backStack.push(targetScreen);
                } else {
                    Toast.makeText(MainActivity.this, "Screen '" + targetScreen + "' not found", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    public void popBackScreen() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (backStack.size() > 1) {
                    backStack.pop();
                    String prevScreenName = backStack.peek();
                    View prevView = screensMap.get(prevScreenName);
                    if (prevView != null) {
                        for (View sv : screensMap.values()) {
                            sv.setVisibility(View.GONE);
                        }
                        prevView.setVisibility(View.VISIBLE);
                    }
                } else {
                    finish();
                }
            }
        });
    }
    `;
  }

  // Compile navigate action
  public compileNavigate(act: LogicAction): string {
    const target = (act.targetScreen || "Screen2").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `navigateToScreen("${target}");`;
  }

  // Compile popBack action
  public compilePopBack(): string {
    return `popBackScreen();`;
  }
}
