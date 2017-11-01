package org.wise.util;

import org.hibernate.boot.SessionFactoryBuilder;
import org.hibernate.boot.spi.MetadataImplementor;
import org.hibernate.boot.spi.SessionFactoryBuilderFactory;
import org.hibernate.boot.spi.SessionFactoryBuilderImplementor;

/**
 * @author Hiroki Terashima
 * This class is registered through Java's ServiceLoader facility and is used in DbInitExporter.java
 * This is a work-around when we upgraded from hibernate4 to hibernate5.
 * See this thread: http://stackoverflow.com/questions/34612019/programmatic-schemaexport-schemaupdate-with-hibernate-5-and-spring-4
 */
public class MetadataProvider implements SessionFactoryBuilderFactory {

  private static MetadataImplementor metadata;

  @Override
  public SessionFactoryBuilder getSessionFactoryBuilder(
      MetadataImplementor metadata, SessionFactoryBuilderImplementor defaultBuilder) {
    this.metadata = metadata;
    return defaultBuilder; // Just return the one provided in the argument itself. All we care about is the metadata
  }

  public static MetadataImplementor getMetadata() {
    return metadata;
  }
}
