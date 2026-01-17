import com.sap.gateway.ip.core.customdev.util.Message
import groovy.xml.*

Message processData(Message message) {
    def body_xml = message.getBody(java.lang.String) as String
    def map = message.getProperties()
    def ex = map.get('CamelExceptionCaught')
    def parser = new XmlParser()
    if (ex != null) {
        if (isXml(body_xml)) {
            Node root = parser.parseText(body_xml)
            def msg = root.message?.text()?.trim() ?: ''
            def errordetails = root.innererror?.errordetails

            if (!msg.isEmpty() && !errordetails.isEmpty()) {
                errordetails.each { node ->
                    def errorMessage = node.errordetail?.message?.text()?.trim() ?: ''
                    if (errorMessage) {
                        msg = msg + errorMessage
                    }
                }
                message.setHeader('errorMessage', msg)
             } else if (!msg.isEmpty()) {
                message.setHeader('errorMessage', msg)
             } else {
                message.setHeader('errorMessage', ex.toString())
            }
        }
        else {
            message.setHeader('errorMessage', ex.toString())
        }
     }  else {
        message.setHeader('errorMessage', body_xml)
    }

    return message
}

def isXml(input) {
    try {
        def parser = new XmlParser()
        parser.parseText(input)
        return true
    }catch (Exception e) {
        return false
    }
}
