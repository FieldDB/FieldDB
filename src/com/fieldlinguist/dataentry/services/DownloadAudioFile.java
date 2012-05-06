package com.fieldlinguist.dataentry.services;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;

import android.app.Activity;
import android.app.IntentService;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.os.Messenger;
import android.util.Log;

public class DownloadAudioFile extends IntentService {
	public static final String TAG = "DownloadAudioFile";
	public static final String REMOTEURL = "URL";
	public static final String FILEPATH = "filepath";
	public static final String OUTDIR = "outdir";
	private int result = Activity.RESULT_CANCELED;

	
	public DownloadAudioFile(String name) {
		super(name);
	}
	public DownloadAudioFile() {
		super("DownloadAudioFile");
	}

	@Override
	protected void onHandleIntent(Intent intent) {
		String remoteurl = intent.getStringExtra(REMOTEURL);
		if(remoteurl == null){
			return;
		}
		String filename = intent.getStringExtra(FILEPATH);
		if(filename == null){
			return;
		}
		String outdir = intent.getStringExtra(OUTDIR);
		if(outdir == null){
			return;
		}
		Log.d(TAG, "I am going to download this URL: " 
				+ remoteurl+filename);
		if (isWritable()) {
			Uri localUri = Uri.parse(outdir+filename);
			
			/* Make dirs if the dirs dont exist */
			String dirs = localUri.getEncodedPath()
					.replace(localUri.getLastPathSegment(), "") ;
			new File(dirs).mkdirs();
			
			File output = new File(localUri.getEncodedPath());
			if (output.exists()) {
				/* dont download the file again */
				result = Activity.RESULT_OK;
			}else{
				/* download the file */
				try {
					URLConnection conn = new URL(remoteurl+filename).openConnection();
				    InputStream is = conn.getInputStream();

				    OutputStream outstream = new FileOutputStream(output);
				    byte[] buffer = new byte[4096];
				    int len;
				    while ((len = is.read(buffer)) > 0) {
				        outstream.write(buffer, 0, len);
				    }
				    outstream.close();
					
					// Successful finished
					result = Activity.RESULT_OK;
	
				} catch (Exception e) {
					Log.e(TAG, "Error: " + e);
				} 
			}
			returnMessage(intent, outdir+filename);
		}

	}

	/**
	 * Determines whether the SD Card is available for writing, or not.
	 * 
	 * Code based on: http://developer.android.com/guide/topics/data/data-storage.html.
	 */
	public static Boolean isWritable() {
		boolean mExternalStorageWriteable = false;
		String state = Environment.getExternalStorageState();

		if (Environment.MEDIA_MOUNTED.equals(state)) {
		    // We can read and write the media
		    mExternalStorageWriteable = true;
		} else if (Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
		    // We can only read the media
		    mExternalStorageWriteable = false;
		} else {
		    // Something else is wrong. It may be one of many other states, but all we need
		    //  to know is we can neither read nor write
		    mExternalStorageWriteable = false;
		}
		
		return mExternalStorageWriteable;
	}/**
	 * Copies a file from the given URL to a file with the given path and given file name.
	 * 
	 * Code based on:
	 * http://www.vogella.com/articles/AndroidServices/article.html#tutorial_intentservice
	 */
	public static String downloadFromUrl(String urlString, String outpath, String filename) {
		
		
		return null;
	}
	public void returnMessage(Intent intent,String outfilepath){
		Bundle extras = intent.getExtras();
		if (extras != null) {
			Messenger messenger = (Messenger) extras.get("MESSENGER");
			Message msg = Message.obtain();
			msg.arg1 = result;
			msg.obj = outfilepath;
			try {
				messenger.send(msg);
			} catch (android.os.RemoteException e1) {
				Log.w(TAG, "Exception sending message", e1);
			}

		}
	}
}
