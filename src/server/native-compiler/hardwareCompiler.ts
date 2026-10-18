import { AndroidComponent, AndroidScreen } from "../../types";

export class HardwareCompiler {
  // Scans all screens and components to collect all necessary Android permissions
  public collectPermissions(configPermissions: string[] | undefined, screens: AndroidScreen[]): string[] {
    const permSet = new Set<string>(configPermissions || ["android.permission.INTERNET"]);

    const scan = (comp: AndroidComponent) => {
      if (comp.type === "Camera") {
        permSet.add("android.permission.CAMERA");
      }
      if (comp.type === "Location/GPS" || comp.type === "LocationSensor") {
        permSet.add("android.permission.ACCESS_FINE_LOCATION");
        permSet.add("android.permission.ACCESS_COARSE_LOCATION");
      }
      if (comp.type === "Wi-Fi") {
        permSet.add("android.permission.ACCESS_WIFI_STATE");
        permSet.add("android.permission.CHANGE_WIFI_STATE");
      }
      if (comp.type === "Bluetooth") {
        permSet.add("android.permission.BLUETOOTH");
        permSet.add("android.permission.BLUETOOTH_ADMIN");
      }
      if (comp.type === "Vibrator" || comp.props?.vibrate) {
        permSet.add("android.permission.VIBRATE");
      }
      if (comp.children && comp.children.length > 0) {
        comp.children.forEach(scan);
      }
    };

    screens.forEach((scr) => {
      if (scr.rootComponent) scan(scr.rootComponent);
    });

    return Array.from(permSet);
  }

  // Generate LocationManager GPS integration with lifecycle-aware cleanup
  public compileLocationComponent(vName: string, compId: string, compName: string, counter: number, initialText: string): string {
    return `
        final TextView ${vName} = new TextView(this);
        ${vName}.setText("${initialText.replace(/"/g, '\\"')}");
        ${vName}.setTextColor(Color.parseColor("#0284C7"));
        ${vName}.setTextSize(14f);
        ${vName}.setPadding(24, 20, 24, 20);
        ${vName}.setBackgroundColor(Color.parseColor("#F0F9FF"));
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);
        registeredViews.put("${compId}", ${vName});
        registeredViews.put("${compName}", ${vName});

        // [HardwareCompiler] Fused/Native Location Listener with Runtime Permission
        try {
            final LocationManager locMgr_${counter} = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
            if (checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED) {
                locListener = new android.location.LocationListener() {
                    @Override
                    public void onLocationChanged(android.location.Location loc) {
                        final String cStr = "GPS Fix: Lat " + String.format(java.util.Locale.US, "%.5f", loc.getLatitude()) + ", Lng " + String.format(java.util.Locale.US, "%.5f", loc.getLongitude()) + " (±" + (int)loc.getAccuracy() + "m)";
                        runOnUiThread(new Runnable() {
                            public void run() {
                                ${vName}.setText(cStr);
                            }
                        });
                    }
                    @Override public void onStatusChanged(String provider, int status, Bundle extras) {}
                    @Override public void onProviderEnabled(String provider) {
                        runOnUiThread(new Runnable() {
                            public void run() { ${vName}.setText("GPS: Signal Active"); }
                        });
                    }
                    @Override public void onProviderDisabled(String provider) {
                        runOnUiThread(new Runnable() {
                            public void run() { ${vName}.setText("GPS: Sensor Disabled in Settings"); }
                        });
                    }
                };
                if (locMgr_${counter} != null) {
                    locMgr_${counter}.requestLocationUpdates(LocationManager.GPS_PROVIDER, 2000, 5, locListener);
                }
            } else {
                requestPermissions(new String[]{android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION}, 201);
            }
        } catch (Exception ignored) {}
    `;
  }

  // Generate Camera Component with Intent capture and preview
  public compileCameraComponent(vName: string, compId: string, compName: string, counter: number): string {
    return `
        LinearLayout ${vName} = new LinearLayout(this);
        ${vName}.setOrientation(LinearLayout.VERTICAL);
        ${vName}.setPadding(20, 20, 20, 20);
        ${vName}.setBackgroundColor(Color.parseColor("#0F172A"));
        LinearLayout.LayoutParams ${vName}_lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        ${vName}_lp.setMargins(16, 12, 16, 12);
        ${vName}.setLayoutParams(${vName}_lp);

        final ImageView camImg_${counter} = new ImageView(this);
        camImg_${counter}.setImageResource(android.R.drawable.ic_menu_camera);
        camImg_${counter}.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 260));
        ${vName}.addView(camImg_${counter});
        activeCameraPreview = camImg_${counter};

        Button camBtn_${counter} = new Button(this);
        camBtn_${counter}.setText("📷 Open Native Camera");
        camBtn_${counter}.setBackgroundColor(Color.parseColor("#2563EB"));
        camBtn_${counter}.setTextColor(Color.WHITE);
        camBtn_${counter}.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkSelfPermission(android.Manifest.permission.CAMERA) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{android.Manifest.permission.CAMERA}, 101);
                } else {
                    try {
                        Intent takePic = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                        if (takePic.resolveActivity(getPackageManager()) != null) {
                            startActivityForResult(takePic, 101);
                        }
                    } catch (Exception ex) {
                        Toast.makeText(MainActivity.this, "Camera Error: " + ex.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            }
        });
        ${vName}.addView(camBtn_${counter});
        registeredViews.put("${compId}", ${vName});
        registeredViews.put("${compName}", ${vName});
    `;
  }
}
