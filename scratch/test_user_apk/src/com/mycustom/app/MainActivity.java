package com.mycustom.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.*;
import android.graphics.Color;
import android.view.Gravity;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;

public class MainActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        ScrollView rootScroll = new ScrollView(this);
        rootScroll.setLayoutParams(new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        rootScroll.setBackgroundColor(Color.parseColor("#0F172A"));

        LinearLayout contentLayout = new LinearLayout(this);
        contentLayout.setOrientation(LinearLayout.VERTICAL);
        contentLayout.setLayoutParams(new ScrollView.LayoutParams(ScrollView.LayoutParams.MATCH_PARENT, ScrollView.LayoutParams.WRAP_CONTENT));
        rootScroll.addView(contentLayout);

        TextView tvHeader = new TextView(this);
        tvHeader.setText("My Custom User App");
        tvHeader.setTextColor(Color.WHITE);
        tvHeader.setTextSize(22f);
        tvHeader.setPadding(32, 32, 32, 32);
        tvHeader.setTypeface(null, android.graphics.Typeface.BOLD);
        tvHeader.setBackgroundColor(Color.parseColor("#4F46E5"));
        contentLayout.addView(tvHeader);

        Button btnAction = new Button(this);
        btnAction.setText("Click My Custom Action");
        btnAction.setTextColor(Color.WHITE);
        btnAction.setBackgroundColor(Color.parseColor("#10B981"));
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.setMargins(32, 32, 32, 32);
        btnAction.setLayoutParams(lp);
        contentLayout.addView(btnAction);

        btnAction.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Toast.makeText(MainActivity.this, "Custom User Action Triggered Successfully!", Toast.LENGTH_LONG).show();
            }
        });

        setContentView(rootScroll);
    }
}