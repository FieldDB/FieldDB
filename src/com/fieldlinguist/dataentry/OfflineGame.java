package com.fieldlinguist.dataentry;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Locale;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.fieldlinguist.dataentry.services.DownloadAudioFile;


import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.AssetFileDescriptor;
import android.content.res.Configuration;
import android.location.Location;
import android.location.LocationManager;
import android.media.MediaPlayer;
import android.net.ConnectivityManager;
import android.net.NetworkInfo.State;
import android.net.Uri;
import android.net.http.SslError;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.Messenger;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class OfflineGame extends Activity {
	private static final String TAG = "OnlineGame";
	public static final boolean D = true;
	
	private String mOutPath;
	private String mInitialGameServerUrl;
	private MediaPlayer mMediaPlayer;
	private String mAudioFileUrl;
    private WebView mWebView;
    
    Location mLastKnownLocation;
    public static final int DOWNLOADING_AUDIO = 54;
    private ArrayList<JSONArray> mBlocksToDownload;
    public int downloadsuccesscount = 0;
    public int downloadfailurecount = 0;
    public int downloadtotalcount = 0;
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main);
		mOutPath =  "file:///sdcard"+this.getFilesDir().getAbsolutePath() + File.separator;
		//"file:///sdcard/SpyOrNot/";

		mWebView = (WebView) findViewById(R.id.webView1);
		mWebView.addJavascriptInterface(new JavaScriptInterface(this),
				"Android");
		mWebView.setWebViewClient(new MyWebViewClient());
		mWebView.setWebChromeClient(new MyWebChromeClient());
		mWebView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
		WebSettings webSettings = mWebView.getSettings();
		webSettings.setBuiltInZoomControls(true);
		webSettings.setDefaultZoom(WebSettings.ZoomDensity.FAR);
		webSettings.setJavaScriptEnabled(true);
		webSettings.setSaveFormData(true);

		webSettings.setDefaultTextEncodingName("utf-8");
		webSettings.setAppCacheEnabled(true);
		webSettings.setDomStorageEnabled(true);
		
		webSettings.setUserAgentString(webSettings.getUserAgentString() + " "
				+ getString(R.string.app_name));
		mInitialGameServerUrl = "file:///android_asset/SpyOrNot/public/view/index.html";// "http://192.168.0.180:3001/";
		mWebView.loadUrl(mInitialGameServerUrl);
		mAudioFileUrl = "";
		
		LocationManager locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
		Location lastKnownNetworkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
		Location lastKnownGPSLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
		if(lastKnownGPSLocation != null ){
			mLastKnownLocation = lastKnownGPSLocation;
			if(lastKnownNetworkLocation != null){
				if(lastKnownGPSLocation.getTime() < lastKnownNetworkLocation.getTime()){
					mLastKnownLocation = lastKnownNetworkLocation;
				}
			}
		}else{
			if(lastKnownNetworkLocation != null){
				mLastKnownLocation = lastKnownNetworkLocation;
			}
		}
	}
	
	class MyWebChromeClient extends WebChromeClient {
		@Override
		public boolean onConsoleMessage(ConsoleMessage cm) {
			if (D)
				Log.d(TAG, cm.message() + " -- From line " + cm.lineNumber()
						+ " of " + cm.sourceId());
			return true;
		}
		@Override
        public boolean onJsAlert(WebView view, String url, String message, final JsResult result) 
        {
            new AlertDialog.Builder(OfflineGame.this)
                .setTitle("")
                .setMessage(message)
                .setPositiveButton(android.R.string.ok,
                        new AlertDialog.OnClickListener() 
                        {
                            public void onClick(DialogInterface dialog, int which) 
                            {
                                result.confirm();
                            }
                        })
                .setCancelable(false)
                .create()
                .show();
            
            return true;
        };
	}

	class MyWebViewClient extends WebViewClient {
//		@Override
//		public boolean shouldOverrideUrlLoading(WebView view, String url) {
//			if (url.endsWith(".mp3") || url.endsWith(".wav") || url.endsWith(".ogg") ){
//                Log.d(TAG, "Trying to play an mp3 or wav");
//                Uri tempPath = Uri.parse(url);
//                MediaPlayer player = MediaPlayer.create(getApplicationContext(), tempPath);
//                player.start();
//                return true;
//            }else{
//            	mWebView.loadUrl(url);
//            }
//			
//			if (D)
//				Log.d(TAG, "Overrode Url loading in WebViewClient"+url);
//			return true;
//		}
		
		public void onReceivedSslError (WebView view, SslErrorHandler handler, SslError error) {
			 handler.proceed() ;
		}


	}
	
	public class JavaScriptInterface {

		Context mContext;

		/** Instantiate the interface and set the context */
		JavaScriptInterface(Context c) {
			mContext = c;

		}
		public void pauseAudio(){
			if(mMediaPlayer != null){
				if(mMediaPlayer.isPlaying()){
					mMediaPlayer.pause();
				}
			}
		}
		public void playAudio(String urlstring){
			Log.d(TAG, "In the play Audio JSI "+urlstring);
			Uri url = Uri.parse(urlstring);
			if(! mAudioFileUrl.equals(urlstring)){
				/*
				 * New audio file
				 */
				mAudioFileUrl = urlstring;
				if(mMediaPlayer != null){
					if(mMediaPlayer.isPlaying() ){
						mMediaPlayer.stop();
					}
					mMediaPlayer.release();
					mMediaPlayer = null;
				}
				mMediaPlayer = new MediaPlayer();
				try {
					if(urlstring.contains("android_asset")){
						/*http://stackoverflow.com/questions/3289038/play-audio-file-from-the-assets-directory */
						AssetFileDescriptor afd = getAssets().openFd(urlstring.replace("file:///android_asset/",""));
						mMediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
					}else{
						mMediaPlayer.setDataSource(urlstring);
					}
					mMediaPlayer.prepareAsync();
					mMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
						@Override
						public void onPrepared(MediaPlayer mp) {
							mMediaPlayer.start();
						}
					});
				} catch (IllegalArgumentException e) {
					Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
				} catch (IllegalStateException e) {
					Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
				} catch (IOException e) {
					Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
				}
				
			}else{
				/*
				 * Same audio file
				 */
				if(mMediaPlayer == null){
					mMediaPlayer = new MediaPlayer();
					try {
						if(urlstring.contains("android_asset")){
							/*http://stackoverflow.com/questions/3289038/play-audio-file-from-the-assets-directory */
							AssetFileDescriptor afd = getAssets().openFd(urlstring.replace("file:///android_asset/",""));
							mMediaPlayer.setDataSource(afd.getFileDescriptor(), afd.getStartOffset(), afd.getLength());
						}else{
							mMediaPlayer.setDataSource(urlstring);
						}
						mMediaPlayer.prepareAsync();
						mMediaPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
							@Override
							public void onPrepared(MediaPlayer mp) {
								mMediaPlayer.start();
							}
						});
					} catch (IllegalArgumentException e) {
						Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
					} catch (IllegalStateException e) {
						Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
					} catch (IOException e) {
						Log.e(TAG,"There was a problem with the  sound "+e.getMessage());
					}
				}
				if(mMediaPlayer.isPlaying() ){
					return;
				}else{
					mMediaPlayer.start();
				}
			}
			
		}
		public void showToast(String toast) {
			Toast.makeText(mContext, toast, Toast.LENGTH_LONG).show();
		}
		public String getCountryCode(){
			return Locale.getDefault().getCountry();
		}
		public String getCountryName(){
			return Locale.getDefault().getDisplayCountry();
		}
		public String getLatitude(){
			String r = "";
			if(mLastKnownLocation != null){
				r = ""+mLastKnownLocation.getLatitude();
			}
			return r;
		}
		public String getLongitude(){
			String r = "";
			if(mLastKnownLocation != null){
				r = ""+mLastKnownLocation.getLongitude();
			}
			return r;
		}
		public void downloadAudioBlock(String audio){
			JSONArray files = null;
			try {
				files = new JSONArray(audio);
				if(mBlocksToDownload == null){
					mBlocksToDownload = new ArrayList<JSONArray>();
				}
				mBlocksToDownload.add(files);
				new DownloadAudioBlockTask().execute();
			} catch (JSONException e) {
				Toast.makeText(mContext, "There was a problem downloading the audio.", Toast.LENGTH_LONG).show();
			} 
			
		}
		public String getWifiOrSdcardDir(){
			ConnectivityManager conMan = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
			State wifi = conMan.getNetworkInfo(ConnectivityManager.TYPE_WIFI).getState();
			if ( (wifi == State.CONNECTED || wifi == State.CONNECTING) ) {
				/*
				 * get audio online
				 */
				return mOutPath;//TODO turn this back into ""
			}
			else {
				/*
				 * get audio offline
				 */
				return mOutPath;
			}
		}
	}

	@Override
	protected void onDestroy() {
		if(mMediaPlayer != null){
			mMediaPlayer.stop();
			mMediaPlayer.release();
		}
		super.onDestroy();
	}

	@Override
	protected void onPause() {
		// TODO Auto-generated method stub
		super.onPause();
	}
	public class DownloadAudioBlockTask extends AsyncTask<Void, Void, Boolean> {
		@Override
		protected Boolean doInBackground(Void... params) {
			JSONArray files = mBlocksToDownload.get(mBlocksToDownload.size()-1);
			downloadtotalcount = files.length();
			for(int i =0; i< files.length(); i++){
				Intent intent = new Intent(getApplicationContext(), DownloadAudioFile.class);
				// Create a new Messenger for the communication back
				Messenger messenger = new Messenger(handler);
				intent.putExtra("MESSENGER", messenger);
				try {
					JSONObject o = files.getJSONObject(i);
					intent.putExtra(DownloadAudioFile.REMOTEURL, o.getString("path") );
					intent.putExtra(DownloadAudioFile.FILEPATH, o.getString("uri") );
					intent.putExtra(DownloadAudioFile.OUTDIR, mOutPath);
					startService(intent);
				} catch (JSONException e) {
					Log.d(TAG,"There was a problem parsing the JSON, skipping this file.");
				}
			}
			return true;
		}

		protected void onPreExecute() {
			showDialog(DOWNLOADING_AUDIO);

		}

		protected void onPostExecute(Boolean result) {
			/*
			 * Just before control is returned to the UI thread
			 */
//			dismissDialog(DOWNLOADING_AUDIO);
			
			
		}
	}
	private Handler handler = new Handler() {
		public void handleMessage(Message message) {
			Object path = message.obj;
			if (message.arg1 == RESULT_OK && path != null) {
				Log.d(TAG, "Download sucessful."+path.toString());
				downloadsuccesscount++;
			} else {
				Log.e(TAG, "Download failed."+path.toString());
				downloadfailurecount++;
				dismissDialog(DOWNLOADING_AUDIO);
				Toast.makeText(getApplicationContext(),"I can't get the game audio, are you connected to WiFi?", Toast.LENGTH_LONG).show();
			}

			if (downloadsuccesscount >= downloadtotalcount){
				downloadfailurecount = 0;
				downloadsuccesscount = 0;
				downloadtotalcount = 0;
				dismissDialog(DOWNLOADING_AUDIO);
				/* tell android to scan the sdcard */
				sendBroadcast(new Intent(Intent.ACTION_MEDIA_MOUNTED,
						Uri.parse("file://" + mOutPath)));
			}
		};
	};
	protected Dialog onCreateDialog(int id) {
		Dialog dialog;
		if (id == DOWNLOADING_AUDIO) {
			dialog = new ProgressDialog.Builder(this).setCancelable(true)
					.setTitle(R.string.please_wait)
					.setMessage(R.string.preparing_audio)
					.create();
		 }else {
				dialog = super.onCreateDialog(id);
		}
		return dialog;
	}
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
		super.onConfigurationChanged(newConfig);
		/*
		 * Doing nothing makes the current redraw properly
		 */
	}
}