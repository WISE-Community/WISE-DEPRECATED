import org.json.JSONObject;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;
import org.wise.portal.service.agent.EchoAgentService;

@Service
public class EchoAgentServiceImpl implements EchoAgentService, MessageListener {

    @Override
    public void onMessage(Message message, byte[] pattern) {
              JSONObject messageJSON = new JSONObject(new String(message.getBody()));

        if (messageJSON.get("type").equals("studentWorkToClassroom")
          || messageJSON.get("type").equals("studentWorkToTeacher")) {
        WebSocketMessage webSockeMessage = new WebSocketMessage("studentWork",
            messageJSON.getString("studentWork"));
        System.out.printf("student work %s", messageJSON.get("studentWork"));
        simpMessagingTemplate.convertAndSend(messageJSON.getString("topic"),
            webSockeMessage);
                    
        
    }


    
}