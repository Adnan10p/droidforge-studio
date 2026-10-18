import { LogicAction } from "../../types";
import { SymbolTable } from "./symbolTable";

export interface NetworkCompilationResult {
  executionCode: string;
  helperMethods?: string[];
}

export class NetworkCompiler {
  private symbolTable: SymbolTable;

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
  }

  // Compile a callApi logic action into robust, native Java background thread code
  public compileCallApi(act: LogicAction, actionIdx: number): string {
    const endpoint = act.endpoint || "https://api.example.com/data";
    const method = (act.method || "GET").toUpperCase();
    const targetId = act.targetId || "";
    const targetSymbol = targetId ? this.symbolTable.lookup(targetId) : undefined;
    const bodyText = (act as any).body ? String((act as any).body).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n") : "";

    const targetUpdateSnippet = targetSymbol
      ? `
          View targetApiView = registeredViews.get("${targetSymbol.id}");
          if (targetApiView instanceof TextView) {
              ((TextView) targetApiView).setText(resBody.length() > 300 ? resBody.substring(0, 300) + "..." : resBody);
          }
      `
      : "";

    const bodySendSnippet = (method === "POST" || method === "PUT") && bodyText
      ? `
          conn.setDoOutput(true);
          conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
          byte[] outputBytes = "${bodyText}".getBytes("UTF-8");
          java.io.OutputStream os = conn.getOutputStream();
          os.write(outputBytes);
          os.close();
      `
      : "";

    return `
        // [NetworkCompiler] Native Background HTTP ${method} Request
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection conn = null;
                BufferedReader reader = null;
                try {
                    URL url = new URL("${endpoint}");
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("${method}");
                    conn.setConnectTimeout(10000);
                    conn.setReadTimeout(15000);
                    conn.setRequestProperty("Accept", "*/*");
                    conn.setRequestProperty("User-Agent", "DroidForge-Android-Client/1.0");
                    ${bodySendSnippet}

                    final int statusCode = conn.getResponseCode();
                    InputStream is = (statusCode >= 200 && statusCode < 300) ? conn.getInputStream() : conn.getErrorStream();
                    final StringBuilder responseBuilder = new StringBuilder();
                    if (is != null) {
                        reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
                        String line;
                        while ((line = reader.readLine()) != null) {
                            responseBuilder.append(line).append("\\n");
                        }
                    }
                    final String resBody = responseBuilder.toString().trim();

                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            ${targetUpdateSnippet}
                            if (statusCode >= 200 && statusCode < 300) {
                                Toast.makeText(MainActivity.this, "HTTP " + statusCode + " OK (" + resBody.length() + " bytes)", Toast.LENGTH_SHORT).show();
                            } else {
                                Toast.makeText(MainActivity.this, "HTTP " + statusCode + " Server Error", Toast.LENGTH_LONG).show();
                            }
                        }
                    });
                } catch (final java.net.SocketTimeoutException timeoutEx) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(MainActivity.this, "API Error: Connection Timed Out", Toast.LENGTH_LONG).show();
                        }
                    });
                } catch (final java.io.IOException ioEx) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(MainActivity.this, "API Network Error: " + ioEx.getMessage(), Toast.LENGTH_LONG).show();
                        }
                    });
                } catch (final Exception ex) {
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(MainActivity.this, "API Error: " + ex.getMessage(), Toast.LENGTH_LONG).show();
                        }
                    });
                } finally {
                    if (conn != null) {
                        try { conn.disconnect(); } catch (Exception ignored) {}
                    }
                    if (reader != null) {
                        try { reader.close(); } catch (Exception ignored) {}
                    }
                }
            }
        }).start();
    `;
  }
}
