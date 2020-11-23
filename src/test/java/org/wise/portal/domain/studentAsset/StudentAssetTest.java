package org.wise.portal.domain.studentAsset;

import static org.junit.Assert.assertEquals;

import java.sql.Timestamp;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.easymock.EasyMockRunner;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.domain.DomainTest;
import org.wise.portal.service.work.StudentAssetJsonModule;
import org.wise.vle.domain.work.StudentAsset;
import org.wise.vle.domain.work.StudentAssetSerializer;

@RunWith(EasyMockRunner.class)
public class StudentAssetTest extends DomainTest {

  StudentAsset asset;

  ObjectMapper mapper;

  StudentAssetJsonModule jsonModule = new StudentAssetJsonModule();

  @Before
  public void setup() {
    super.setup();
    jsonModule.addSerializer(StudentAsset.class, new StudentAssetSerializer());
    mapper = new ObjectMapper();
    mapper.registerModule(jsonModule);
    asset = new StudentAsset();
    asset.setId(15);
    asset.setRun(run);
    asset.setPeriod(period);
    asset.setWorkgroup(workgroup);
    asset.setIsReferenced(false);
    asset.setFileName("abc.png");
    asset.setFilePath("/345/assets");
    asset.setFileSize(512L);
    asset.setClientSaveTime(new Timestamp(1L));
    asset.setServerSaveTime(new Timestamp(2L));
    asset.setClientDeleteTime(new Timestamp(5L));
    asset.setServerDeleteTime(new Timestamp(6L));
  }

  @Test
  public void serialize() throws Exception {
    String json = mapper.writeValueAsString(asset);
    assertEquals("{\"id\":15,\"runId\":1,\"periodId\":100,\"workgroupId\":64,\"nodeId\":null," +
        "\"componentId\":null,\"componentType\":null,\"isReferenced\":false," +
        "\"fileName\":\"abc.png\",\"filePath\":\"/345/assets\",\"fileSize\":512," +
        "\"clientSaveTime\":1,\"serverSaveTime\":2,\"clientDeleteTime\":5,\"serverDeleteTime\":6}",
        json);
  }

}
