import com.sap.gateway.ip.core.customdev.util.Message;
import groovy.json.JsonSlurper;

def Message processData(Message message) {
    //Body 
    def body = message.getBody(java.lang.String);
    def jsonSlurper = new JsonSlurper()
    def object = jsonSlurper.parseText(body.toString());
       
    message.setProperty("EndpointURL",object.destinationConfiguration.URL);
    message.setProperty("CloudConnectorLocationId",object.destinationConfiguration.CloudConnectorLocationId);
    message.setProperty("client","sap-client="+object.destinationConfiguration['sap-client']);
    def map = message.getHeaders();
    def query = map.get("constant");
    def querySplit = query.tokenize("&");   
    querySplit.each{item -> 
        if(item.indexOf("filter") > -1){
            message.setProperty("filter", item);
        }
    }
    return message;
}