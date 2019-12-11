import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.stereotype.Service;
import org.wise.portal.service.agent.EchoAgentService;

@Service
public class EchoAgentServiceImpl implements EchoAgentService, MessageListener {

    @Override
    public void onMessage(Message message, byte[] pattern) {
        // TODO Auto-generated method stub
        
        
    }


    
}