package org.wise.portal.service.tag;

import static org.easymock.EasyMock.expect;
import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.EasyMock.isA;
import static org.easymock.EasyMock.replay;
import static org.easymock.EasyMock.verify;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.easymock.EasyMockRunner;
import org.easymock.Mock;
import org.easymock.TestSubject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.wise.portal.dao.project.TagDao;
import org.wise.portal.domain.Tag;
import org.wise.portal.domain.impl.TagImpl;
import org.wise.portal.service.tag.impl.TagServiceImpl;

@RunWith(EasyMockRunner.class)
public class TagServiceImplTest {

  @TestSubject
  private TagService tagServiceImpl = new TagServiceImpl();

  @Mock
  private TagDao<Tag> tagDao;

  private Tag tag;

  @Before
  public void setup() {
    tag = new TagImpl();
    tag.setId(1);
  }

  @Test
  public void updateTag_ExistingTag_ShouldUpdateTag() {
    tagDao.save(tag);
    expectLastCall();
    replay(tagDao);
    Tag updatedTag = tagServiceImpl.updateTag(tag);
    assertEquals(tag.getId(), updatedTag.getId());
    verify(tagDao);
  }

  @Test
  public void deleteTag_ExistingTagNoReferences_ShouldDeleteTag() {

  }
}
