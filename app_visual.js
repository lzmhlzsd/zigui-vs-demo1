﻿var express = require( 'express' );
var path = require( 'path' );
var app = express();
var server = require( 'http' ).Server( app );
// var io = require('socket.io')(server);
var request = require( 'request' );
var _ = require( 'underscore' );
var rf = require( "fs" );
var io = require( 'socket.io' )( server );
var rooms = {
    1: 'a',
    2: 'b'
}
var server_url = "http://192.168.20.235:8688/Module/SystemData/YuJiangBoard.asmx"

app.use( express.static( path.join( __dirname, 'web' ) ) );
server.listen( 5000, function () {
    console.log( 'server staring..., port: 5000' );
} );

app.get( '/room', function ( req, res ) {
    if ( req.query.v == 1 ) {
        res.sendFile( __dirname + '/web/demo1.html' );
    }
} );

io.on( 'connection', function ( socket ) {
    var roomid = getParam( socket.request.headers.referer.split( '?' )[1], "v" )
    if ( typeof rooms[roomid] != 'undefined' ) {
        socket.join( roomid );    // 加入房间
    }
    //socket.emit('news', { port: port });
    // socket.on('my other event', function(data) {
    //     console.log(data);
    // });
    socket.on( 'disconnect', function () {
        io.emit( 'user disconnected' );
    } );//
} );

function getParam( url, name ) {
    var reg = new RegExp( "(^|&)" + name + "=([^&]*)(&|$)", "i" );
    var r = url.match( reg );
    if ( r != null ) return unescape( r[2] );
    return null;
}

var room = ["a", "b"]
setInterval( function () {
    getMacStatus_s( 30056, function ( res ) {
        console.log( res );
        io.to( 1 ).emit( 'getMacStatus', res )
    } )
}, 5000 )

setInterval( function () {
    getAlarmInfo_s( 30056, function ( res ) {
        io.to( 1 ).emit( 'getAlarmInfo', res )
    } )
    getStatusRatio_s( 30056, function ( res ) {
        io.to( 1 ).emit( 'getStatusRatio', res )
    } )
}, 10000 )

function getMacStatus_s( room, callback ) {
    request.post( server_url + '/getMacStatus',
        { form: { id: room } }, function ( error, response, data ) {
            var d = JSON.parse( data );
            console.log('/getMacStatus')
            console.log(d.result)
            callback( d.result )
        } )
}

function getAlarmInfo_s( room, callback ) {
    request.post( server_url + '/getAlarmInfo',
        { form: { id: room } }, function ( error, response, data ) {
            var d = JSON.parse( data );
            console.log('/getAlarmInfo')
            console.log(d.result)
            callback( d.result )
        } )
}

function getStatusRatio_s( room, callback ) {
    request.post( server_url + '/getStatusRatio',
        { form: { id: room } }, function ( error, response, data ) {
            var d = JSON.parse( data );
            console.log('/getStatusRatio')
            console.log(d.result)
            callback( d.result )
        } )
}

