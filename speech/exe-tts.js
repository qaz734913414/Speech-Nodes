/*
*本节点使用了text_to_speech.exe
*因此，在使用本节点之前，请先将text_to_speech.exe文件复制到node-red根目录xia
*同时需要将msc_x64.dll和msc.dll文件复制到node-red根目录下
*节点在运行过程中会在node-red根目录下生成一个text_to_speech_result.pcm文件
*/

module.exports = function(RED) {
	
	var my_msg = new Object();
    function TextToSpeech(config) {
        RED.nodes.createNode(this,config);
        var node = this;
		
		var util   = require('util'),
			exec  = require('child_process').exec,
			child;
        this.on('input', function(msg) {
			child = exec('text_to_speech.exe ' + msg.text,//执行text_to_speech.exe，msg.text是需要合成的语句
				function (error, stdout, stderr) {
					if (error !== null) {
					  console.log('exec error: ' + error);
					}
					read();
				});
            node.send(msg);
			node.send(my_msg);
        });
    }
	
	function read(){
		var fs = require('fs');
		var file_name = 'text_to_speech_result.pcm';//需要读取的音频文件
		fs.readFile(file_name , function(err, data) { 
			if(err) { 
				console.error(err); 
			} else{				
				my_msg.audio_len = data.length;
				my_msg.audio_data = data;
				console.log(my_msg);
			} 
		});
	}
    RED.nodes.registerType("text-to-speech",TextToSpeech);
}