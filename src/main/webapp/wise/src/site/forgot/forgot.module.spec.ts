import { ForgotModule } from './forgot.module';

describe('ForgotModule', () => {
  let forgotModule: ForgotModule;

  beforeEach(() => {
    forgotModule = new ForgotModule();
  });

  it('should create an instance', () => {
    expect(forgotModule).toBeTruthy();
  });
});
