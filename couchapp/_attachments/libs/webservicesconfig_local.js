console.log("Loading Webservices info");
/* Extends the OPrime class */
var OPrime = OPrime || {};

OPrime.websiteUrl = "https://localhost:3182";
OPrime.authUrl = "https://localhost:3183";
OPrime.audioUrl = "https://localhost:3184";
OPrime.lexiconUrl = "https://localhost:3185";
OPrime.corpusUrl = "https://localhost:3186";
OPrime.activityUrl = "https://localhost:3187";
OPrime.widgetUrl = "https://localhost:3188";
OPrime.chromeClientUrl = function() {
  return window.location.origin;
};

/*
 * not using secure couch because it would require extra set up for developers
 * to run locally which is unneccesary
 */
OPrime.defaultCouchConnection = function() {
  var d = {
    protocol : "https://",
    domain : "localhost",
    port : "6984",
    pouchname : "default",
    path : ""
  };
  /*
   * If its a couch app, it can only contact databases on its same origin, so
   * modify the domain to be that origin. the chrome extension can contact any
   * authorized server that is authorized in the chrome app's manifest
   */
  if (OPrime.isCouchApp()) {
    d.domain = window.location.origin.replace("https://", "").replace(
        "http://", "");
  }
  return d;

};

OPrime.contactUs = "<a href='https://docs.google.com/spreadsheet/viewform?formkey=dGFyREp4WmhBRURYNzFkcWZMTnpkV2c6MQ' target='_blank'>Contact Us</a>";

OPrime.publicUserStaleDetails = function() {
  return {
    token : "$2a$10$VEzkBbg7kN5LpiEurR7HgOuBxtcgl0g2E/1RQq8OTju7LbqZb2n7S",
    encryptedUser : "confidential:VTJGc2RHVmtYMTlGK0ZiN2k0bGlaVm5mWWFHNnlHV29hWGhlTytWdEJ0Wmg2ZVB0dFN6Y0FjWjdXdXpUVEJoYm53OVBuM05yenp5dTRWb1BvRDZqWkdmcEt5WjlsOHNTV1dXRHRuamw0YVo1Qkx2cWNuZUFmT0xKMGMrVkpKS3pic3JxWDhCcVNjbm1iTjdjT2RDQkxzMlZ6TjJsaFdHaWJsRFphTmpsSWNobm4rMCs1OHVYYTNGM0FtODFTTUlFZ29KakhWWk1xbWVxdVh5SGRxQmdyQzdYRkRKMlpwdjZkS004ODdiS25uZnNQdUwydGpXRjAvblNOeklEN0s2cE9wUjBnOFpwRVpQZy82MmYySiswbTZhVlNsZ3gvWFJvakh2dnNncDUxdTVHdGxoL2dOU0ttRFY1NGpnZVE1V3N3NVp6cUFUeGxmOWxmQXJ2MmN4RFdYUDJJSXFsS0kvZWtGOWFxRHgyZWFrVlZBQ1prcUNFTi9KSU9yaXZoZEZHbkZHRENaV0tBNC9iakhkaDc2OUFkakFXcEw2MUw5OGEvQ0xsTXVCSHE5U3lOMTdLSlNMamR5d2ZxTWN5dXlYc3dPUmxCZlNveDkvR3YvVVZlSXNGSjZBTGZ6Y3crYzlwakpLK2JkMEZwQTJVMzFmNElXb3h2dkc0MHZiZStUcG1lVmw0ajJ6aUZ0RytQYXlGQ3BwWCtNMDVBeHFnWDdwOFNVdVlMZXZnRCsvTlRpQW5uNHdEdm9qZmlpaWhzZWhZemJHK2N3aHpsQUgyMzhwSkN1ZG9lNVVSeTlEY0ZQNldMSDdYeW8xaXBEUTRCY05icnZqUk9YeU5BQ1N5MmVPWnFrU0RhN1hRbWZMYUczU3hUMlRyRTR1ck10RThsRVFmNFZjdVUwakZLRjJMRGR6TXg2K25RM242R0U5aUdOMEdMUDA2SzNvV0lTZktkaUsyd3IyQ3BkMFZvQkE4S2YvZlArUW9DRHVFQy9UVitoWERuRVFJZVdBYUgxUCtGdzFvTWlaWFZKUzQ3T1V6b1hSY0M4cmVpTnJtcEl6WUpUSkVacHQxQ2w4ZUc3dXJ3Um4vQUFnTFlVekVpbCtmZ0wzOW9mdFZSU1RBU24xNVNJczYvWE1WZENlbmJiNXFPWTdteFE4aVJucnVibHdQZFYwNkZlVTlQNkRiU3VWRzFsUElUUFRodjV6N1lrdCtpdzF3ZkRFWnc5Rmp5V3ZCbTdJenFzRWpGdWlFbU9kc1hPRGFVMUo3WEsvd1FPbHd0ZXR2Rm1GOW1QdUZCNUUvMW9aOEltUXlSaFpXdzIxcG52azBQbDd1VnVNTmJvMTl1bk85cXNMckFITUFOMkpzelkzbStiSTJyQVN4S0JLWEowNlY5anR3QWdhUjZLdmFLbklWaXBBVENDbE1ib2hoSXlmSnVmRVZzQW11VUVhcnBiQ3FpM0VMN0ZDZXFOK0xMTXVOUlJQbjlSQjNkdXpSZ0RmTlNvendqZ1d3ejMrMHlvTEF1ajVKWXZ1NWJFNnArY2tQZjZDdnc4YldaeHd6bzFPUTFyZ3dHaFpGb01JeEtDZnNzb2UyclhNeTVpTGY3Q1djcUVMOEx5MTUwRFpYU3dtY0FJbm9pMC9VZnEwT01rUjc4di9wNUw0dWhWQkVmMFdlaTkvRWttazBnbVE4ZWx3RWZKN3ozc1BMajM5NE80a2dCNkwvYVI0RkR4YksrTERqbitJbFI4OXRudUNZekNzWGgrMXdSU0IyRGludnBrMSsyWG1uTVpZMzcwcmNDZERXY1FTYXhLZ0pIY1VNK2F4L1h1eGFDem0wK003V0ppQ2pHQytubTlWbDB2cklnb1E2aHBtR0ozWS81KzBoRTIxV09jZGdEQy9UdmE4UlFBeTR1eUZ5R0preW53UDJ4RkxNOC9RTTZvc08rNWVyaSsrdnFWWDUwOTg0cERwZ1pwYWdvWGw0bjQ4R1VTeExHazhFU1FWRW9reHFuWUQ2TFgyRWRXU0FtU1lKc01qR2xVb2tOR295U0xaV0tOZ2xaMFRTVGlpeGtJdjhvd0dzaUFoYzZBWWozQzBpeGJSczQrU0sxci9vQXRTMUJTY2RIMWQyZlhzMnFqVzkvWnlhWDhjOTFnY2VFS0xJZ2NodkZaZlpkd0h1VHlyYWlLeXlPaTJUOGdYN3Bva2tETnh2bWd5TVRQZjQvYUdpZmNmUjNRYW5ONVoxNjgxY0ZVdXROM2F3Y2RyWWNEVkxBdlBuaGVXNDVFaEh2TFA5VjcxVjBwcVhFMU5QZnFhYXRKbGhHUDZuZWJZeDVyTVd2QnFKYzVOUzZQUGtrUnhYbUpoVGlxenNiMEl3MG1YNi9LdmlEY1U0V0xYMjJxZ0FuY2VIaUMxNFZOdnd4RFJ2TFRBVjVlY3BUNVpKenJCTEx4d3Y2MWkyR0Vmbzk5R3hqdGsxblB2OFBDZ2dQdWlBbFlCRHFNTHY0bnNjUFpGamk4bURxMU9JUWNqc0wycFZMOWM1L1pTN0p6NXlvU3lHdWt6cmI1NHhiazdGSkt3ZGltemxwYjVDTFlJOTN4NWhOaXROVDBWY05KWVJtbkNqeGlsSjVRdkhZa29xd3BiYnhzdCtUbnlKN21yTncySUlzQ284Qk9TQkJxei9MQTN1alQrTlRYWGR5SzNwa1EwMkZwM2ZEVXQ4MXp2K2xaeUF5a0JqT2dkdHNiK3JtOTl3b1NIbDNVVjN1NkdsZ29jTXV3MjEzL2Y2NXFSRnJNcWtGQmh0RktlSTI1MFBSaCtUdElsb09vTG5EUU0ramo2U1YyamJ1Zjd5a08rb1h2eHNxUngrNU1FNk5aVDFRRVJicVYvZ0E1bkdGcEEzS0lUd0psN2duV1ZmYThqYko1bjhMYmVvamVqV2UyMjV4WXVhTWJNUys1MStXUCtxbWxaZnJCdDV2OHozb2hKa0dFVVVkRVNUWXAxakUyejdxVVRsSEllNUJZejg1SlBBUHZGcC9FSjdJYnlrUGhiN295WFlobmt2cDcra1hEREgxaTdoMTZGTmhTYTUzaDFYckJMVkVsYk15R1ZGWlUzU012K09jLytHdnhGZW9Db3hFTXVJUUF6U01CM3ZIaFhqWDlQYzZSN2d5QUxscGJzMUtwempZNEZKQjJDQW92bGs3TXNveld2a0RVM1NWNWM4L09YbFlQaG0vODViUDZiSjVYMVJMR25XUzhZQVFxUGxCZTNMWjV2VnF1K1AxQmFMbzhqUVpsRmJPVGZCOFhwMVJPRmVkYWFyYXd0TFVoMi9HRWNGUk9Ic0xiTFdFTk1SOUI1ZTlBZnU4dHcwZjkxd3I5Q3E2UnRETmlmVFcvcXlHUTJVWjJqOFpTQXZOb3BreFN1eWRHQlp0M3R2dEVaODRYUlp5eGQvS3NnWFBoQlM5V3RHUSs5SjdyanRqZW9sOHRnczEvdEVEMGxPUFpQeEZCUUljSTVPT3BiY0tHS1FteXBJYjZhdHV6c3JRYmpmcklybDdlQTFQOTRqSWdyRVhkWEVWbmFCZC9yOVowbFF4ZjgyTi82YUZ6VG15S2VFUklRTVNUdisxQU5UOWl0bmNnQXF6MjkzcVdnT3MzQ0NmWFEyZXRoM2FCU0FZanlTRVA2WFpqQW5lWmJla09JZ3BZOHg1anBmWWdJSlhPMU9tK3RhU2cvMHA5SEYyQWlQR2FsT24xek5VMVpEZEZUcHNTNlE3WUcyMGZhbTV6MDUvT3lpZTVIanY4emk0ekZJVWRucE5iNHhCZTVFeHcxa05mR3dqM0FuSlgvVkJGdmR1SkJubFpYMy9vMTVwS0w4eTZNUTFna3lFTC9MZ3pnWS9RMDRUUVBZSzF5RUxhelFBdG9NSDlTWHJJaU9BKzRLMi9nQnI3NzBjNk91VExRTXdrZys5ajd1a2wrSThOWDdvb3prNnZmVzFFTzBTYzhnV3hINFZUWW5WSDZDK0JidjdoMTkybUtIZ1dNd2VLVHFkSDlRWEhLdUJ5VmtkT2s0ZURJNVdCL0NHZ2Ywd2FXRU9waW1WaFc5cnpXUG9IZkpxOW1GU1RteWR0Z2E4cy84U1pjSlFNRWFyV0dzK0wxUnFHdHlXK296LzJoUFh5K21lUDlMUlpKRmM3RmROK0hVSUtiOGcweFVaTHJFZ2NzNFpPZ1BKdWh4SEtIWHZUa05LTlZOSEtDOU1EemxYNXNoV1BCOVN6Zlk5Q29YUWtzNW9jWkFGYVI1ZG9XVzZvYlRpYzhjOStEV2duYXpTd2lyekhEOVlRZEU4TlluT1V6LzY2cGhJdzJWZWpOQVlGcy94c1RhNVN5cXNTRVRFYnBQZ3dKOVZhU1FVbjg3Y2p2bmRGejIwa0htSUR3VHJaZGU1eTBha2tSLzltbWEvUWhENDBJelBua0ZWQ1hhRUcvNC9IejZLcWJqWjY5Ly9JUDJJWEY4QVhwVWhaTlJmRmdGOVJpRXlGRWRZN2dwVGxHZ0NuWGRiNTM4cnJZa3NVNjBWZlBBaXpaNHNIY01XaWd6OXM1d1dIK1lyMFVNT2hEY0x3PT0=",
    username : "public"
  };
};

OPrime.guessCorpusUrlBasedOnWindowOrigin = function(dbname) {
  var optionalCouchAppPath = "";
  if (OPrime.isCouchApp()) {
    var corpusURL = window.location.origin;
    if (corpusURL.indexOf("lignsync.org") >= 0) {
      corpusURL = "https://corpus.lingsync.org";
    } else if (corpusURL.indexOf("authdev.fieldlinguist.com") >= 0) {
      corpusURL = "https://ifielddevs.iriscouch.com";
    } else if (corpusURL.indexOf("prosody.linguistics.mcgill") >= 0) {
      corpusURL = "https://prosody.linguistics.mcgill.ca/corpus";
    } else if (corpusURL.indexOf("localhost") >= 0) {
      // use the window origin
    }
    optionalCouchAppPath = corpusURL + "/" + dbname + "/_design/pages/";
  }
  return optionalCouchAppPath;
};