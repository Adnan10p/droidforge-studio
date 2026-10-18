import { LogicAction } from "../../types";
import { SymbolTable } from "./symbolTable";

export class StorageCompiler {
  private symbolTable: SymbolTable;

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
  }

  // Generate Java Helper class for SQLite Database
  public generateDatabaseHelperClass(): string {
    return `
    // [StorageCompiler] Native SQLite Database Helper
    class DroidForgeDatabaseHelper extends SQLiteOpenHelper {
        public DroidForgeDatabaseHelper(Context ctx) {
            super(ctx, "DroidForgeLocal.db", null, 1);
        }
        @Override
        public void onCreate(SQLiteDatabase db) {
            db.execSQL("CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, payload TEXT, timestamp INTEGER);");
            db.execSQL("CREATE TABLE IF NOT EXISTS key_value (key_name TEXT PRIMARY KEY, val_data TEXT);");
        }
        @Override
        public void onUpgrade(SQLiteDatabase db, int oldV, int newV) {
            db.execSQL("DROP TABLE IF EXISTS records;");
            db.execSQL("DROP TABLE IF EXISTS key_value;");
            onCreate(db);
        }
    }
    `;
  }

  // Compile databaseInsert action
  public compileDatabaseInsert(act: LogicAction, actionIdx: number): string {
    const rawVal = act.value !== undefined ? String(act.value) : "New Record";
    const cleanVal = rawVal.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

    return `
        // [StorageCompiler] SQLite Insert Record
        try {
            if (appDb != null) {
                ContentValues cv_${actionIdx} = new ContentValues();
                cv_${actionIdx}.put("payload", "${cleanVal}");
                cv_${actionIdx}.put("timestamp", System.currentTimeMillis());
                long newRowId_${actionIdx} = appDb.insert("records", null, cv_${actionIdx});
                Toast.makeText(MainActivity.this, "Database: Record #" + newRowId_${actionIdx} + " Saved!", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception dbEx) {
            Toast.makeText(MainActivity.this, "DB Insert Error: " + dbEx.getMessage(), Toast.LENGTH_SHORT).show();
        }
    `;
  }

  // Compile databaseQuery action
  public compileDatabaseQuery(act: LogicAction, actionIdx: number): string {
    const targetId = act.targetId || "";
    const targetSymbol = targetId ? this.symbolTable.lookup(targetId) : undefined;

    const targetUpdate = targetSymbol
      ? `
          View targetDbView = registeredViews.get("${targetSymbol.id}");
          if (targetDbView instanceof TextView) {
              ((TextView) targetDbView).setText(dbResult.isEmpty() ? "No Records Found" : dbResult);
          }
      `
      : "";

    return `
        // [StorageCompiler] SQLite Query Records
        try {
            if (appDb != null) {
                Cursor cursor_${actionIdx} = appDb.rawQuery("SELECT payload, timestamp FROM records ORDER BY id DESC LIMIT 10", null);
                StringBuilder sb_${actionIdx} = new StringBuilder();
                while (cursor_${actionIdx}.moveToNext()) {
                    sb_${actionIdx}.append("• ").append(cursor_${actionIdx}.getString(0)).append("\\n");
                }
                cursor_${actionIdx}.close();
                final String dbResult = sb_${actionIdx}.toString().trim();
                ${targetUpdate}
                Toast.makeText(MainActivity.this, "DB Query: Loaded successfully", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception queryEx) {
            Toast.makeText(MainActivity.this, "DB Query Error: " + queryEx.getMessage(), Toast.LENGTH_SHORT).show();
        }
    `;
  }

  // Compile preferencesSave action (SharedPreferences)
  public compilePreferencesSave(act: LogicAction): string {
    const k = (act.variableName || "app_pref_key").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const v = (act.variableValue !== undefined ? String(act.variableValue) : "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');

    return `
        // [StorageCompiler] SharedPreferences Key-Value Save
        if (appPrefs != null) {
            appPrefs.edit().putString("${k}", "${v}").apply();
            Toast.makeText(MainActivity.this, "Stored: [${k}]", Toast.LENGTH_SHORT).show();
        }
    `;
  }

  // Compile preferencesLoad action
  public compilePreferencesLoad(act: LogicAction): string {
    const k = (act.variableName || "app_pref_key").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const targetId = act.targetId || "";
    const targetSymbol = targetId ? this.symbolTable.lookup(targetId) : undefined;

    const targetUpdate = targetSymbol
      ? `
          View targetPrefView = registeredViews.get("${targetSymbol.id}");
          if (targetPrefView instanceof TextView) {
              ((TextView) targetPrefView).setText(loadedVal);
          }
      `
      : "";

    return `
        // [StorageCompiler] SharedPreferences Key-Value Load
        if (appPrefs != null) {
            String loadedVal = appPrefs.getString("${k}", "");
            ${targetUpdate}
            Toast.makeText(MainActivity.this, "Loaded: [${k}]", Toast.LENGTH_SHORT).show();
        }
    `;
  }
}
