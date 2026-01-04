import com.sap.gateway.ip.core.customdev.util.Message;
import groovy.json.JsonSlurper;
import groovy.json.JsonOutput;

def Message processData(Message message) { 

	def body = message.getBody(String.class);
    def jsonSlurper = new JsonSlurper();
    def object = jsonSlurper.parseText(body);
	object.count = message.getProperty("count");
    message.setBody(JsonOutput.toJson( object ));
    return message;
}