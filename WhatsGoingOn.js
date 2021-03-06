/*
    Inspired by https://gist.githubusercontent.com/LoranKloeze/e1cf5bb9f797b6128363d467d008ff0e/raw/e9ec7ab1546766a11fd9fbd889eefe5b30132012/whatsapp_phone_enumerator_floated_div.js
    
    WhatsGoingOn is a script to try to figure out whether 2 people have been chatting to each other on WhatsApp.
    
    - Firstly it'll check if the first user is online every 10 seconds
    - If they are online it'll then check to see if the second user has been online for the next 10 minutes (also checking every 10 seconds for the second user). 
    - If the second user gets a hit too, a new row in the table will be outputted to the console which will tell you what time both users were online at.
    - Repeat (after 10 minutes, to try avoid false positives)
    
    To run:
    
    - Log in to WhatsApp web as normal
    - Open up the console in your browser
    - Change the value of userA and userB to be a real mobile number (eg. 353851234567) in this script, make sure none have their status hidden (very few people do!)
    - Copy and paste the file in to the console
    - A message will appear along with a table which just has sample data for now
    - If both users are online within the time periods set in this file (and mentioned above), a new row will be added to the table
    - The rows include the time that userA was online along with the time that userB was online
    - Leave running for whatever period of time you want
    
    Notes:
    The script could check online statues more often, but I've tried to keep the checks to a minimum while still making the script actually useful to some extent.
    WhatsApp may throttle your calls to them or even ban your account, so don't use this with your main mobile number to be safe.

*/
var userA = +919686629904;
var userB = +919406939298;
var tenSeconds = 10000;
var tenMinutes = 600000;

var firstInterval;
var secondInterval;

var valueToPush = {};
valueToPush.userOneTime = "Example 1";
valueToPush.userTwoTime = "Example 2";

var chattingTable = [];
chattingTable.push(valueToPush);
console.table(chattingTable);

/*
    Let's kick off - every 10 seconds check for userA being online
    We check for userA being online first, could check for userB being online if userA isn't online in this function, but let's keep it simple
*/
start();

function start() {

    firstInterval = setInterval(function() {


        isPhoneOnline(userA).then(function(result) {

            checkOtherUser(userB, new Date());
        }).catch(function(error) {
            // do nothing, first user isn't online
        })

    }, tenSeconds);

}
console.log('If both users have been online within 10 minutes of each other, a new table will automatically be created');

/*
    So we got a hit with one user being online, but that's not too useful unless we know the other person is also online within the time window.
    This function will check the online status of the other user, and if they are online it'll push a new entry to the table including the times
    that both users were online at.
*/
function checkOtherUser(phoneNumber, userAOnlineTime) {

    //every 10 seconds we'll check if the other user is online, we'll wait a max of 10 minutes to get a hit. After 10 minute we'll go back to the first check
    numberOfChecks = 0;
    maxNumberOfChecks = tenMinutes / tenSeconds; // max of 60 API calls from this function    

    // stop the first interval, we'll start it again after the second interval is finished
    clearInterval(firstInterval);

    secondInterval = window.setInterval(function() {

        ++numberOfChecks;

        isPhoneOnline(phoneNumber).then(function(result) {

            // both people could be chatting, insert a new row to the table
            valueToPush = {};
            valueToPush.userOneTime = userAOnlineTime.toLocaleString();
            userBOnlineTime = new Date();
            valueToPush.userTwoTime = userBOnlineTime.toLocaleString();

            chattingTable.push(valueToPush);
            console.table(chattingTable);

            restart();
        }).catch(function(error) {
            // do nothing, second user isn't online
        })

        if (numberOfChecks == maxNumberOfChecks) {
            restart();
        }

    }, tenSeconds);

}

/*
    Start from scratch, can be called when:
    - We've spotted that 2 users have been online in the same time period
    - Only one user was online and we've already checked the second user's status for 10 minutes
*/
function restart() {

    window.clearInterval(secondInterval);

    // it wouldn't really be fair to go straight back to the first interval check after potentially getting a match since it could be an insant hit, let's give them a chance ;)
    setTimeout("start()", tenMinutes);
}

/*
    Promise that checks if a given phone number is online on WhatsApp
*/
function isPhoneOnline(phoneNumber) {

    return new Promise(function(resolve, reject) {

        Store.Presence.find(phoneNumber + '@c.us').then(function(d) {
            if (d.isOnline) {

                resolve(phoneNumber)

            } else {

                reject(phoneNumber)
            }
        });
    })
}
