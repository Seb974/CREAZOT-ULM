import { CamerasList } from "./CamerasList";
import { CamerasCreate } from "./CamerasCreate";
import { CamerasEdit } from "./CamerasEdit";
import { CameraShow } from "./CameraShow";

const cameraResourceProps = {
  list: CamerasList,
  create: CamerasCreate,
  edit: CamerasEdit,
  hasShow: false,
  show: CameraShow
};

export default cameraResourceProps;
