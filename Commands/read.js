const Discord = require('discord.js')
const client = new Discord.Client()
const axios = require('axios')
const got = require("got");
require('dotenv').config();

const config = require('./config.json')
const command = require('./command.js')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

var arr ;

client.on('ready', async () => {
    console.log('The client!');



    async function calls(){

        arr = db.get('users').value()

        for(var i = 0; i < arr.length; i++){
            const moment = require('moment');
            var created = moment().format('DD/MM/YY');
            let res = await axios
                .get(
                    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${arr[i].districtid}&date=${created}`,
                    {
                        headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                    },
                })
                .then((response) => {
                    var array = response.data;

                    for(var j = 0; j < array.sessions.length; j++)
                    {
                        if(array.sessions[j].available_capacity>0)
                        {
                            if(array.sessions[j].min_age_limit <= arr[i].Age){
                                arr[i].ifslot=true;
                            }
                        }
                    }
                    

                    if(arr[i].ifslot===true){

                        //dm
                        client.users.fetch(`${arr[i].discordid}`, false).then((user) => {
                            user.send("Vaccine is available now!");
                            user.send(" Visit https://www.cowin.gov.in/home to get more info.");
                        });
                        //client.get_user(arr[i].discordid).send("Vaccine is available now!")

                    }

                                
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }

        arr = []
    }    

    var checkhours = 1, checkminutes = checkhours * 60, checkthe_interval = checkminutes * 60 * 1000;
    setInterval(function() {
        calls()
    }, checkthe_interval);

})

client.login(process.env.TOKEN)