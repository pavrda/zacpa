//document.addEventListener("deviceready", onDeviceReady, false);
//onDeviceReady();

var pushNotification;
var token = "";

function onDeviceReady() {

    //$("#app-status-ul").append('<li>deviceready event received</li>');
    infoZobraz("deviceready event received");

    if(window.localStorage.getItem("token")!=null)
    {
        token = window.localStorage.getItem("token");
        $("#registraceButton").val("Odregistrovat od přijímání zpráv");
    } else
    {
        infoZobraz('Pro používání aplikaci zmáčkněte "Zaregistrovat k přijímání zpráv"');
        $("#zmenitNastaveniButton").css("display","none");
    }


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
    $("#zmenitNastaveniButton").css("display","block");

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

function serverSend(typ,success_callback, error_callback)
{
    console.log("serverSend");
    $.ajax({
        type: 'GET',
        url: 'http://demo.livecycle.cz/lc/content/zacpa.POST',
        data : {
            typ: typ,
            token: token
        },
        success: function(data) {
            console.log("serverSend success");
            success_callback();
        },
        error: function(data) {
            console.log("serverSend error");
            ajaxError("serverSend",typ,data);
        }
    });


}

function ajaxError(source,msg,data)
{
    alert(source + msg);
}

function registraceOK()
{
    infoZobraz("Zaregistrováno!");
    window.localStorage.setItem("token",token);
    // TODO ulozit ulice a cisla do persistance
    $("#registraceButton").val("Odregistrovat od přijímání zpráv");
    $("#zmenitNastaveniButton").css("display","block");
}
function odregistraceOK()
{
    // smazat celou persistanci? asi ne
    window.localStorage.removeItem("token");
    token ="";
    infoZobraz("Odregistrováno");
    $("#registraceButton").val("Zaregistrovat k přijímání zpráv");
    $("#zmenitNastaveniButton").css("display","none");
}


function register() {
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
            $("#app-status-ul").append('<li>registering android</li>');
            pushNotification.register(successHandler, errorHandler, {"senderID":"131911362908","ecb":"onNotificationGCM"});		// required!
        } else {
            $("#app-status-ul").append('<li>registering iOS</li>');
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
        $("#app-status-ul").append('<li>push-notification: ' + e.alert + '</li>');
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
                serverSend("registrace",registraceOK);
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
    // Your iOS push server needs to know the token before it can push to this device
    // here is where you might want to send it the token for later use.
}

function successHandler (result) {
    $("#app-status-ul").append('<li>success:'+ result +'</li>');
}

function errorHandler (error) {
    $("#app-status-ul").append('<li>error:'+ error +'</li>');
}


