import { FeaturesModule } from './features.module';

describe('FeaturesModule', () => {
  let featuresModule: FeaturesModule;

  beforeEach(() => {
    featuresModule = new FeaturesModule();
  });

  it('should create an instance', () => {
    expect(featuresModule).toBeTruthy();
  });
});
