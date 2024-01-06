// I shall integrate edge cases what if user entered wrong address or any other error.


const express = require("express");
const https = require("https");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const app = express();



app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function (req, res) {
  res.render("index", { aboutParagraph: "" });
  
});



app.post("/",function(requ,resp){

    const options = {
        "method": "POST",
        "hostname": "apis.tollguru.com",
        "port": null,
        "path": "/toll/v2/origin-destination-waypoints",
        "headers": {
          "content-type": "application/json",
          "x-api-key": "TOLL_GURU_API_KEY"
        }
      };
    console.log("Post recieved");
    
    const req = https.request(options, function (res) {
        const chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function () {
          const body = Buffer.concat(chunks);
          const parseBody = JSON.parse(body);
          console.log(parseBody);
          // resp.send(parseBody);
          // if

          const infoBody = {
            origin:{
              lat:parseBody.summary.route[0].location.lat,
              lng:parseBody.summary.route[0].location.lng,
              addr:parseBody.summary.route[0].address,
            },
            destination:{
              lat:parseBody.summary.route[1].location.lat,
              lng:parseBody.summary.route[1].location.lng,
              addr:parseBody.summary.route[1].address,
            },
            vechicle : parseBody.summary.vehicleType,
            fuelInfo: {
             rate:parseBody.summary.fuelPrice.value,
             rUnits:parseBody.summary.fuelPrice.units,
             city:parseBody.summary.fuelEfficiency.city,
             hwy:parseBody.summary.fuelEfficiency.hwy,
             mUnits:parseBody.summary.fuelEfficiency.units,

            }, 
            routeDet:{
              hasToll:parseBody.routes[0].summary.hasTolls,
              url:parseBody.routes[0].summary.url,
              distance:parseBody.routes[0].summary.distance.metric,
              duration:parseBody.routes[0].summary.duration.text,
            },
            costs:{
              cash:parseBody.routes[0].costs.cash,
              fuelCost:parseBody.routes[0].costs.fuel,
              tag:parseBody.routes[0].costs.tagAndCash,
            },
            tolls:parseBody.routes[0].tolls, 
          }
          
          // resp.send(infoBody);
          console.log(infoBody.tolls);
          // console.log(infoBody.origin.lng);
          resp.render("mapRender", { routeJSON:infoBody });
        });
      });
      req.write(JSON.stringify({
        from: {address: requ.body.origin},
        to: {address: requ.body.destination},
      //   waypoints: [{address: 'Bridgewater Township , New Jersey'}],
        serviceProvider: 'gmaps',
      //   vehicle: {
      //     type: '2AxlesTaxi',
      //     weight: {value: 20000, unit: 'pound'},
      //     height: {value: 7.5, unit: 'meter'},
      //     length: {value: 7.5, unit: 'meter'},
      //     axles: 4,
      //     emissionClass: 'euro_5'
      //   }
      }));
      req.end();
})





app.listen(3000,function(){
    console.log("Server running at port 3000");
})
                                                     