import { UserAgentType, isApiClientUserAgent } from '@app/nutscrapedb';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'JavaScriptCompatibleUserAgent', async: false })
export class JavaScriptCompatibleUserAgentConstraint
  implements ValidatorConstraintInterface
{
  validate(userAgentKey: string, args: ValidationArguments) {
    const object = args.object as any;

    if (!object.enableJavaScript) {
      return true;
    }

    if (!userAgentKey) {
      return false;
    }

    const actualUserAgent =
      UserAgentType[userAgentKey as keyof typeof UserAgentType];

    return !isApiClientUserAgent(actualUserAgent);
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;

    if (!object.userAgent) {
      return 'User agent must be specified when JavaScript execution is enabled.';
    }

    return 'User agent is not compatible with JavaScript execution. Use a browser user agent (CHROME, FIREFOX, SAFARI, EDGE) when enableJavaScript is true.';
  }
}
