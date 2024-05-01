declare interface Task {
  id: string;
  title: string;
  description: string;
  createDate: number;
  completed: boolean;
  completedDate: number;
}

declare interface DetailTask extends Task {
  detail: string;
}

declare type Action<T> = React.ComponentProps<T>["action"];
declare type Loader<T> = React.ComponentProps<T>["loader"];
