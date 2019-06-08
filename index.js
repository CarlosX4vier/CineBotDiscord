var express = require('express');
var app = express();
const port = 3000;
var server = app.listen(port,  () => console.log(`Example app listening on port ${port}!`))
var io = require('socket.io', { rememberTransport: false })(server);
var iso = require('iso8601-duration');
let ejs = require('ejs')


const youtube = require('./youtube');

const Discord = require('discord.js');
const client = new Discord.Client();
const Sala = require('./sala.js');

app.set('view engine', 'ejs')    // Setamos que nossa engine será o ejs
app.set('views', './view');

setInterval(() => {
  for (i = 0; i < salas.length; i++) {
    console.log("Verificacao 0");
    if (salas[i].playlist.length >= 1) {
      console.log("Verificacao 1");
      if (salas[i].tempo >= salas[i].playlist[0].duracao) {
        console.log("Verificacao 2");
        salas[i].tempo = 0;
        salas[i].playlist.shift();
      } else {
        console.log("Verificacao 2.1");
        salas[i].atualizarTempo();
        io.to(salas[i].id).emit("time", { duracao: salas[i].tempo, sala: salas[i].id, video: salas[i].playlist[0].id});
      }
    }
    // console.log("eMITINDO: " + salas[i].tempo + " para " + salas[i].id);
  }
}, 1000);


var salas = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  //var channels = 
  /* canais.forEach(
       canal =>
           canal.channels.forEach(
               a => {
                   if(a.type =='text'){
                       a.send("A");
                   }
               }
           )
   );*/
  ///   console.log(canais.member.array());

});

function verificarSala(salaTeste) {
  return salas.findIndex(salaCheck => salaCheck.id == salaTeste);
}

client.login('MzkyOTAzMTcwNTQ1ODExNDU3.XPaWwQ.J0SA8eN3y8mGEblnA6jiPB39o3U');


client.on('message', async (msg) => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }
  if (msg.content.includes("!assistir")) {
    const Video = require('./video');

    msg.reply("O endereço da sala do servidor '" + msg.guild.name + "' é http://localhost/?sala=" + msg.guild.id);
    console.log(msg.content.split(" ")[1]);
    var url = new URL(msg.content.split(" ")[1]);
    var idVideo = url.searchParams.get('v');
    r = await youtube.main(idVideo);
    //console.log(iso.toSeconds(iso.parse(r.items[0].contentDetails.duration)));
    salas[verificarSala(msg.guild.id)].playlist.push(new Video(idVideo, r.items[0].snippet.title, iso.toSeconds(iso.parse(r.items[0].contentDetails.duration)), msg.author))
    console.log(salas[verificarSala(msg.guild.id)]);
  }
});



app.get('/', (req, res) => {

  res.render("index", { teste: "AAA" });

  /*console.log(client.guilds);

  var canais = client.guilds.array();
  var channels = canais;
  console.log(channels);
*/
  //canais.forEach(canal => canais.channels[585497914827210801].send("A"))

})


io.on('connection', function (socket) {
  let salaID = socket.handshake.query.sala;
  salaUser = new Sala(salaID, "Sala numero" + salaID);

  socket.join(salaUser.id, function () {
    console.log("enviado para sala: " + salaUser.id);

    console.log('a user connected');
    console.log(verificarSala(salaUser.id))
    if (verificarSala(salaUser.id) == -1) {
      salas.push(salaUser);
    }
  });

});