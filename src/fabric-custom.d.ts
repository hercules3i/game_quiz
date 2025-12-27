import 'fabric';

declare module 'fabric' {
  namespace fabric {
    interface IGroupOptions extends IObjectOptions {
      fontSize?: number;
      text?: string;
      objectID?: string;
      rectObject?: any;
    }

    interface IPathOptions extends IObjectOptions {
      idObject1?: string;
      idObject2?: string;
      objectID?: string;
      port1?: any;
      port2?: any;
    }

    interface IImageOptions extends IObjectOptions {
      isBackground?: boolean;
      objectID?: string;
      userID?: string;
      objectType?: string;
    }

    interface ITextboxOptions extends IObjectOptions {
      objectID?: string;
    }

    interface Image {
      isBackground?: boolean;
      objectID?: string;
      userID?: string;
      objectType?: string;
    }

    interface Group {
      fontSize?: number;
      text?: string;
      objectID?: string;
      rectObject?: any;
    }

    interface Path {
      idObject1?: string;
      idObject2?: string;
      objectID?: string;
      port1?: any;
      port2?: any;
      controllers?: any[];
    }
  }
}

