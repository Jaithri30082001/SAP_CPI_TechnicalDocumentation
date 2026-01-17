import com.sap.gateway.ip.core.customdev.util.Message;
import groovy.json.JsonSlurper;
def Message processData(Message message) {
    //Body 
    def body = message.getBody(java.lang.String);

       String url;
       String cloudConnection;
       String client;
       def map = message.getHeaders();
	   def messageHeader=map.get("Content-Type");

	    if(messageHeader.equals("application/json"))
       {
            def jsonSlurper = new JsonSlurper()
            def object = jsonSlurper.parseText(body.toString());
            url=object.destinationConfiguration['URL'];
            cloudConnection=object.destinationConfiguration['CloudConnectorLocationId'];
            client=object.destinationConfiguration['sap-client'];
            message.setProperty("client","sap-client="+client);

       }else if(messageHeader.equals("application/octet-stream"))
       {
            String [] output = body.split('\n')
                     .drop(1);

          for(String value : output)
          {
               if(value.contains("URL"))
               {
                  String [] urlSplitted = value.split("=");
                  url = urlSplitted.drop(1).join("=");
                  if(url.contains("\\"))
                  {
                      url=url.replaceAll("\\\\","");
                  }

               }else if(value.contains("CloudConnectorLocationId"))
               {
                 println("CloudConnectorLocationId found")
                   String [] valueToSplit = value.split("=");
                   cloudConnection= valueToSplit[1];
               }
          }
       }

    message.setProperty("EndpointURL",url);
    message.setProperty("CloudConnectorLocationId",cloudConnection);
    return message;
}