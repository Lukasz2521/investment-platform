import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './admin-app/app';
import { config } from './admin-app/app.config.server';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
