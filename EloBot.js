const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log("Connected as " + client.user.tag + ".")
})

var pref = "!";
var eloDictionary = {};
var registeredDuelists = new Set();
var ratingConstant = 50;

function probability(rating1, rating2){
  return 1.0 * 1.0 / (1 + 1.0 * Math.pow(10, 1.0 * (rating1-rating2)/400));
}

function runDuel(memberFirst, memberSecond, message){ //returns 0 or 1, depending on the winner
  var winner = Math.floor(Math.random()*2);
  return winner;
}

client.on('message', (message) => {
 if(message.author.bot) return; 
 if(message.content.startsWith(pref)){
   var msg = message.content.substring(1).split(" ");
   if(msg[0] == "register"){
    var pings = message.mentions.members;
    var len = pings.array().length;
    if(len != 1){
      message.channel.send("Please only register one duelist.");
    }
    else{
      var newMember = pings.first();
      if(newMember.user.id == message.member.user.id || message.member.roles.find(r => r.name === "Admin")){
       if(registeredDuelists.has(newMember.user.id)){
        message.channel.send(newMember.user.username + " is already registered.");
       }
       else{
        registeredDuelists.add(newMember.user.id);
        eloDictionary[newMember.user.id] = 1500;
        message.channel.send(newMember.user.username + " has been registered!");
       }
      }
      else{
        message.channel.send("You cannot register a member that is not yourself (unless you are an Admin).");
      }
    }
   }
   if(msg[0] == "constant"){
    if(message.member.roles.find(r => r.name === "Admin")){
      if(message.content.length > 9){
        var newConstant = message.content.substring(10);
        if(isNaN(newConstant)){
          message.channel.send("Please only change the rating constant to a number."); 
        }
        else{
          ratingConstant = newConstant;
          message.channel.send("Rating constant updated to " + newConstant + ".");
        }
      }
    }
    else{
      message.channel.send("Only Admins can adjust the rating constant!");
    }
   }
   if(msg[0] == "duel"){
    var duels = message.mentions.members;
    var duelArr = duels.array();
    var len = duelArr.length;
    if(len != 2){
      message.channel.send("Please only have two members duel each other.");
    }
    else{
      var firstMember = duelArr[0]; var secondMember = duelArr[1];
      if(!registeredDuelists.has(firstMember.user.id) && !registeredDuelists.has(secondMember.user.id)){
        message.channel.send("Neither duelist has registered!");
      }
      else if(!registeredDuelists.has(firstMember.user.id)){
        message.channel.send(firstMember.user.username + " has not registered!");
      }
      else if(!registeredDuelists.has(secondMember.user.id)){
        message.channel.send(secondMember.user.username + " has not registered!");
      }
      else{
        message.channel.send(firstMember.user.username + " is dueling " + secondMember.user.username + "!");
        var winner = duelArr[runDuel(firstMember, secondMember, message)];
        var ratingFirst = eloDictionary[firstMember.user.id]; var ratingSecond = eloDictionary[secondMember.user.id];
        var probabilityB = probability(ratingFirst, ratingSecond);
        var probabilityA = probability(ratingSecond, ratingFirst);
        if(winner.user.id == firstMember.user.id){
          message.channel.send(firstMember.user.username + " has won!");
          ratingFirst = ratingFirst + ratingConstant * (1 - probabilityA);
          ratingSecond = ratingSecond + ratingConstant * (0 - probabilityB);
        }
        else{
          message.channel.send(secondMember.user.username + " has won!");
          ratingFirst = ratingFirst + ratingConstant * (0 - probabilityA);
          ratingSecond = ratingSecond + ratingConstant * (1 - probabilityB);
        }
        eloDictionary[firstMember.user.id] = ratingFirst; eloDictionary[secondMember.user.id] = ratingSecond;
        message.channel.send("Ratings have been updated. " + firstMember.user.username + ": " + Math.round(ratingFirst) + ", " + secondMember.user.username + ": " + Math.round(ratingSecond) + ".");
      }
    }
   }
   if(msg[0] == "rating"){
    var pings = message.mentions.members;
     var len = pings.array().length;
     if(len != 1){
      message.channel.send("Please only get the rating of one duelist.");
     }
     else{
      var currMember = pings.first();
      if(registeredDuelists.has(currMember.user.id)){
        message.channel.send("The rating of " + currMember.user.username + " is " + eloDictionary[currMember.user.id] + " points.");
       }
       else{
        message.channel.send("This user is not registered.");
       }
     }
   }
   if(msg[0] == "leaderboard"){
    var board_data = [];
    for(var key in dict){
     var currUser = client.fetchUser(key); 
    }
   }
 } 
})

client.login("secret-login-token")

