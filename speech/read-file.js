/*
*本节点用于测试语音识别和语音合成节点
*语音数据通过my_msg.audio_len和my_msg.audio_data传递给语音识别节点
*文本数据通过my_msg.text传递给语音合成节点
*/

module.exports = function(RED) {		
		var fs = require('fs');
		var file_name = 'text_to_speech_result.pcm';//需要读取的音频文件		
		var my_msg = new Object();  
		var node
    function ReadFile(config) {
        RED.nodes.createNode(this,config);
		node = this;
        this.on('input', function(msg) {			
			read();
			this.send(msg);
        });
    }
	function read(){
			fs.readFile(file_name , function(err, data) { 
			if(err) { 
				console.error(err); 
			 } else{				
				my_msg.audio_len = data.length;//将读取音频文件的长度传入my_msg
				my_msg.audio_data = data;//将音频文件数据传入my_msg
				my_msg.text = "春眠不觉晓";//
				node.send(my_msg);
			} 
		});
	}
    RED.nodes.registerType("read-file",ReadFile);
}