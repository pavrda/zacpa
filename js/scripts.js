//document.addEventListener("deviceready", onDeviceReady, false);
//onDeviceReady();

var pushNotification;
var token = "";

function onDeviceReady() {

    //$("#app-status-ul").append('<li>deviceready event received</li>');
    infoZobraz("deviceready event received");
    localStorageNacti();

    token = "345";

}

function localStorageNacti()
{
    if(window.localStorage.getItem("token")!=null)
    {
        token = window.localStorage.getItem("token");
    }
    if(window.localStorage.getItem("vypZap")!=null)
    {
        var vypZap = window.localStorage.getItem("vypZap");
        if(vypZap)
        {
            $( "#checkBoxVypZap").prop('checked', true);
        }

    }

    // TODO dalsi nastaveni

}

function infoZobraz(msg)
{
    $("#info").html(msg);
}

function registerFake()
{
    // odregistrace
    if(token!="")
    {
        serverSend("odregistrace",odregistraceOK);
        return;
    }

    //registrace

    // vola registraci GCM
    infoZobraz("vola registraci GCM");
    // prijata registrace

    // zobrazi hlasku a cislo
    infoZobraz("Zaregistrováno v GCM");
    token = "123";
    // ulozi na server
    serverSend("registrace",registraceOK);
    // ulozi do persistance
    infoZobraz("Uloženo na serveru");
    window.localStorage.setItem("token",token);
    // TODO ulozit ulice a cisla do persistance
    $("#registraceButton").val("Odregistrovat od přijímání zpráv");


}

function registraceRun()
{
    // odregistrace
    if(token!="")
    {
        serverSend("odregistrace",odregistraceOK);
        return;
    }

    register();
}

function nastaveniZmena()
{
    serverSend(nastaveniZmenaOk,ajaxError);
}

function serverSend(success_callback, error_callback)
{
    console.log("serverSend");
    // jestli neexistuje token, zaregistrovat
    if(token=="")
    {
        register();
        return;
    }
    console.log("token:"+token);

    // TODO odregistraci

    if($( "#checkBoxVypZap" ).is(':checked'))
    {
        var zapVyp = "true";
    } else
    {
        var zapVyp = "false";
    }
    console.log("zapVyp:"+zapVyp);
    var stav = $( "#stav").val();
    console.log("stav:"+stav);
    var ulice = $( "#ulice option:selected").text();
    console.log("ulice:"+ulice);
    $.ajax({
        type: 'POST',
        url: 'http://demo.livecycle.cz/lc/content/zacpa',
        data : {
            zapVyp: zapVyp,
            token: token,
            stav: stav,
            ulice: ulice,
            _charset_: "utf-8"
},
        success: function(data) {
            console.log("serverSend success");
            success_callback();
        },
        error: function(data) {
            console.log("serverSend error");
            ajaxError("serverSend","",data);
        }
    });


}

function ajaxError(source,msg,data)
{
    alert("Error: " + source + msg);
}

function registraceOK()
{
    infoZobraz("Zaregistrováno!");
    window.localStorage.setItem("token",token);
    // TODO ulozit ulice a cisla do persistance
    $("#registraceButton").val("Odregistrovat od přijímání zpráv");
}
function odregistraceOK()
{
    // smazat celou persistanci? asi ne
    window.localStorage.removeItem("token");
    token ="";
    infoZobraz("Odregistrováno");
    $("#registraceButton").val("Zaregistrovat k přijímání zpráv");
}
function nastaveniZmenaOk()
{
    // TODO aby se ukladal token jen pri registraci
    window.localStorage.setItem("token",token);
    infoZobraz("Nastavení změněno");
}


function register() {
    console.log("Register");
    /*
    document.addEventListener("backbutton", function(e)
    {
        $("#app-status-ul").append('<li>backbutton event received</li>');

        if( $("#home").length > 0)
        {
            // call this to get a new token each time. don't call it to reuse existing token.
            //pushNotification.unregister(successHandler, errorHandler);
            e.preventDefault();
            navigator.app.exitApp();
        }
        else
        {
            navigator.app.backHistory();
        }
    }, false);
*/
    infoZobraz("vola registraci GCM");

    try
    {
        pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android') {
            //$("#app-status-ul").append('<li>registering android</li>');
            pushNotification.register(successHandler, errorHandler, {"senderID":"131911362908","ecb":"onNotificationGCM"});		// required!
        } else {
            //$("#app-status-ul").append('<li>registering iOS</li>');
            pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});	// required!
        }
    }
    catch(err)
    {
        txt="There was an error on this page.\n\n";
        txt+="Error description: " + err.message + "\n\n";
        alert(txt);
    }
}

// handle APNS notifications for iOS
function onNotificationAPN(e) {
    if (e.alert) {
        //$("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
        navigator.notification.alert(e.alert);
    }

    if (e.sound) {
        var snd = new Media(e.sound);
        snd.play();
    }

    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

// handle GCM notifications for Android
function onNotificationGCM(e) {
    //$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');

    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                //$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);

                token = e.regid;
                // ulozi na server
                infoZobraz("Ukládání nastavení na server");
                serverSend(nastaveniZmenaOk,ajaxError);
            }
            break;

        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                //$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');

                // if the notification contains a soundname, play it.
                //var my_media = new Media("/android_asset/www/"+e.soundname);
                //my_media.play();
            }
            /*
            else
            {	// otherwise we were launched because the user touched a notification in the notification tray.
                if (e.coldstart)
                    $("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
                else
                    $("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
            }
            */
            //$("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
            //$("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
            infoZobraz(e.payload.message+ "<br>" +e.payload.msgcnt);
            break;

        case 'error':
            //$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
            infoZobraz("ERROR -> MSG:" + e.msg );
            break;

        default:
            //$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
            infoZobraz("Neznámám chyba");
            break;
    }
}

function tokenHandler (result) {
    $("#app-status-ul").append('<li>token: '+ result +'</li>');
    infoZobraz("token" + result);
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}

function successHandler (result) {
    $("#app-status-ul").append('<li>success:'+ result +'</li>');
    infoZobraz("success"+ result);
}

function errorHandler (error) {
    $("#app-status-ul").append('<li>error:'+ error +'</li>');
    infoZobraz("error" + error);
}


