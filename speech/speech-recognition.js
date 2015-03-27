module.exports = function(RED) {
    function SpeechRecognition(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		var http = require('http');
		var qs = require('querystring');
		var access_token;//使用百度语音识别REST API所需的token
		var my_msg = new Object();
		var my_data = new Object();//调用百度语音识别REST API所需的参数
		
		my_data.cuid = "B8-88-E3-7B-6B-F6";//本机Mac地址
		my_data.audio_format = 'wav';//音频格式，pcm为pcm，wav为wav，flac为x-flac
		my_data.audio_rate = "16000";//音频的采样率，需要按读取的音频实际值修改，百度只支持8000、16000两个值,采样率回影响识别率
		
		var node = this;
        this.on('input', function(msg) {
			console.log("speech-recognition:", msg.audio_data);
			my_data.audio_data = msg.audio_data;//获取音频文件数据
			my_data.audio_len = msg.audio_len;//获取音频文件的长度
			get_token();
            node.send(my_msg);
        });
		
		function get_token(){//获取百度授权的token
			var data = {
				grant_type : 'client_credentials',
				client_id : 'pihNONRntYzmHpLWyShSTH2h',
				client_secret : 'WYbVpqsyatUCeLjUjnQMt6Ezu7FuMbv8'};//这是获取access_token需要提交的数据

			var content = qs.stringify(data);

			var options = {
				host: "openapi.baidu.com",//获取access_token的主机
				path: '/oauth/2.0/token?' + content,//获取access_token的路径
				method: 'GET'
			};
			  
			var req = http.request(options, function (res) {
				res.on('data', function (chunk) {
					var token = chunk.toString();
					var access = JSON.stringify(token);
					var start = access.indexOf(":");
					var end   = access.indexOf(",");
					access_token = access.substring(start + 3, end - 2);  
					my_data.token = access_token;//对http请求返回的结果进行处理，获得access_token
					speech_recognition();
				});
			});

			req.on('error', function (e) {
				console.log('problem with request: ' + e.message);
			});
			req.end();
		}

		function speech_recognition(){//进行语音识别
			
			var data = {
				cuid : my_data.cuid,
				token : my_data.token
			};//这是调用语音识别API所需要提交的参数

			var content = qs.stringify(data);
			
			var option_get = {
				host: "vop.baidu.com",
				path: '/server_api?' + content,
				method: 'POST',
				headers: {
					'Content-Type': 'audio/' + my_data.audio_format + '; rate=' + my_data.audio_rate,
					'Content-Length': my_data.audio_len
				}
			};

			var req_get = http.request(option_get, function(res){
				res.on('data', function(data){
					var access = data.toString();
					var start = access.indexOf("[");
					var end   = access.indexOf("]");
					var result_text = access.substring(start + 2 , end - 2);//对返回结果进行处理，获得识别结果
					my_msg.result_text = result_text;
					//node.log("识别结果："  + result_text);
				});
			});
			req_get.write(my_data.audio_data);//将音频数据写入body
			req_get.end(); 
		}    
    }		
	RED.nodes.registerType("speech-recognition",SpeechRecognition);
}