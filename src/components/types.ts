import { Topic, Immutable } from "@foxglove/studio";
import { uniq } from "lodash";


// Define ROS messages types

export interface Header {
    seq?: number
    stamp: { sec: number; nsec: number }
    frame_id: string
}

export interface Point {
    x: number
    y: number
    z: number
}

export interface Quaternion {
    x: number
    y: number
    z: number
    w: number
}

export interface Pose {
    position: Point
    orientation: Quaternion
}

export interface PoseStamped {
    header: Header
    pose: Pose
}

export interface PoseWithCovariance {
    pose: Pose
    covariance: number[]
}

export interface Vector3 {
    x: number
    y: number
    z: number
}

export interface Twist {
    linear: Vector3
    angular: Vector3
}

export interface TwistWithCovariance {
    twist: Twist
    covariance: number[]
}

export interface Odometry {
    header: Header
    child_frame_id: string
    pose: PoseWithCovariance
    twist: TwistWithCovariance
}

export interface BatteryState {
    voltage: number;
    temperature: number;
    current: number;
    charge: number;
    capacity: number;
    design_capacity: number;
    percentage: number;
    power_supply_status: number;
    power_supply_health: number;
    power_supply_technology: number;
    present: boolean;
    cell_voltage: number[];
    cell_temperature: number[];
    location: string;
    serial_number: string;
}

export interface Float { data: number }

export interface String { data: string }

export interface KeyValue { key: string; value: string }
export interface DiagnosticStatus {
    // Possible levels of operations
    // OK=0
    // WARN=1
    // ERROR=2
    // STALE=3
    level: number
    name: string
    message: string
    hardware_id: string
    values: KeyValue[]
}
export interface DiagnosticArray {
    status: DiagnosticStatus[]
}

export interface Imu {
    angular_velocity: {
        x: number;
        y: number;
        z: number;
    };
    angular_velocity_covariance: number[];
    linear_acceleration: {
        x: number;
        y: number;
        z: number;
    };
    linear_acceleration_covariance: number[];
    orientation: {
        x: number;
        y: number;
        z: number;
        w: number;
    };
    orientation_covariance: number[];
}

export interface Duration {
    data: {
        sec: number,
        nsec: number
    }
};

// mavros_msgs/State
export interface MavrosState {
    header: Header
    connected: boolean
    armed: boolean
    guided: boolean
    manual_input: boolean
    mode: string
    system_status: number
}

// mavros_msgs/StatusText
export interface MavrosStatusText {
    // Severity levels
    // EMERGENCY = 0
    // ALERT = 1
    // CRITICAL = 2
    // ERROR = 3
    // WARNING = 4
    // NOTICE = 5
    // INFO = 6
    // DEBUG = 7
    header: Header
    severity: number
    text: string
}

// mavros_msgs/RCIn
export interface RCIn {
    header: Header
    rssi: number
    channels: number[]
}

export interface GPSPoint {
    lat: number;
    lon: number;
};

export interface Path {
    header: Header;
    poses: PoseStamped[];
};

export interface Joy {
    header: Header;
    axes: number[];
    buttons: number[];
};


export type Matrix3x3 = [number, number, number, number, number, number, number, number, number];

export enum NavSatFixPositionCovarianceType {
    COVARIANCE_TYPE_UNKNOWN = 0,
    COVARIANCE_TYPE_APPROXIMATED = 1,
    COVARIANCE_TYPE_DIAGONAL_KNOWN = 2,
    COVARIANCE_TYPE_KNOWN = 3,
}

export enum NavSatFixStatus {
    STATUS_NO_FIX = -1, // unable to fix position
    STATUS_FIX = 0, // unaugmented fix
    STATUS_SBAS_FIX = 1, // with satellite-based augmentation
    STATUS_GBAS_FIX = 2, // with ground-based augmentation
}

export enum NavSatFixService {
    SERVICE_GPS = 1,
    SERVICE_GLONASS = 2,
    SERVICE_COMPASS = 4,
    SERVICE_GALILEO = 8,
}

export interface NavSatFix {
    header: Header
    latitude: number;
    longitude: number;
    altitude: number;
    status?: { status: NavSatFixStatus; service: NavSatFixService };
    position_covariance: Matrix3x3;
    position_covariance_type: NavSatFixPositionCovarianceType;
};

export interface CompressedImage {
    header: Header;
    format: string;
    data: number[];
};

export interface RegionOfInterest {
    x_offset: number;
    y_offset: number;
    height : number;
    width: number;
    do_rectify: boolean;
};

export interface CompressedImage {
    header: Header;
    height: number;
    width: number;
    distortion_model: string;
    D: number[];
    K: number[];
    R: number[];
    P: number[];
    binning_x: number;
    binning_y: number;
    roi: RegionOfInterest;
};

// Topics filter functions for use in topic selection options
interface SelectOption { value: string, label: string }
function getOptions(topics: Immutable<Topic[]> | undefined, ACCEPTED_DATATYPES: string[]): SelectOption[] {
    let filtered = uniq(topics
        ?.filter(
            (topic) => topic.schemaName != undefined && ACCEPTED_DATATYPES.includes(topic.schemaName),
        ))
    return filtered.map(({ name }) => ({ value: name, label: name }))
}

const DIAGNOSITC_DATATYPES: string[] = [
    "diagnostic_msgs/DiagnosticArray",
    "diagnostic_msgs/msg/DiagnosticArray",
    "ros.diagnostic_msgs.DiagnosticArray",
];
export function getDiagnosticOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, DIAGNOSITC_DATATYPES);
}

const FLOAT_DATATYPES: string[] = [
    "std_msgs/Float64", "std_msgs/msg/Float64", "ros.std_msgs.Float64",
    "std_msgs/Float32", "std_msgs/msg/Float32", "ros.std_msgs.Float32",
];
export function getFloatOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, FLOAT_DATATYPES);
}

const BATTERY_DATATYPES: string[] = [
    "sensor_msgs/BatteryState",
    "sensor_msgs/msg/BatteryState",
    "ros.sensor_msgs.BatteryState"
];
export function getBatteryOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, BATTERY_DATATYPES);
}

const ORIENTATION_DATATYPES: string[] = [
    "sensor_msgs/Imu", "sensor_msgs/msg/Imu", "ros.sensor_msgs.Imu",
    "geometry_msgs/Quaternion", "geometry_msgs/msg/Quaternion", "ros.geometry_msgs.Quaternion",
];
export function getOrientationOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, ORIENTATION_DATATYPES);
}

const ODOMETRY_DATATYPES: string[] = [
    "nav_msgs/Odometry",
    "nav_msgs/msg/Odometry",
    "ros.nav_msgs.Odometry"
];
export function getOdometryOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, ODOMETRY_DATATYPES);
}

const GPS_DATATYPES: string[] = [
    "sensor_msgs/NavSatFix",
    "sensor_msgs/msg/NavSatFix",
    "ros.sensor_msgs.NavSatFix"
];
export function getGPSOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, GPS_DATATYPES);
}

const STATE_DATATYPES: string[] = [
    "mavros_msgs/State",
    "mavros_msgs/msg/State",
    "ros.mavros_msgs.State"
];
export function getStateOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, STATE_DATATYPES);
}

const STATUSTEXT_DATATYPES: string[] = [
    "mavros_msgs/StatusText",
    "mavros_msgs/msg/StatusText",
    "ros.mavros_msgs.StatusText"
];
export function getStatusTextOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, STATUSTEXT_DATATYPES);
}

const POINT_DATATYPES: string[] = [
    "geometry_msgs/Point",
    "geometry_msgs/msg/Point",
    "ros.geometry_msgs.Point"
];
export function getPointOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, POINT_DATATYPES);
}

const PATH_DATATYPES: string[] = [
    "nav_msgs/Path",
    "nav_msgs/msg/Path",
    "ros.nav_msgs.Path"
];
export function getPathOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, PATH_DATATYPES);
}

const STRING_DATATYPES: string[] = [
    "std_msgs/String",
    "std_msgs/msg/String",
    "ros.std_msgs.String"
];
export function getStringOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, STRING_DATATYPES);
}

const JOY_DATATYPES: string[] = [
    "sensor_msgs/Joy",
    "sensor_msgs/msg/Joy",
    "ros.sensor_msgs.Joy"
];
export function getJoyOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, JOY_DATATYPES);
}

const COMPRESSEDIMAGE_DATATYPES: string[] = [
    "sensor_msgs/CompressedImage",
    "sensor_msgs/msg/CompressedImage",
    "ros.sensor_msgs.CompressedImage"
];
export function getCompressedImageOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, COMPRESSEDIMAGE_DATATYPES);
}

const CAMERAINFO_DATATYPES: string[] = [
    "sensor_msgs/CameraInfo",
    "sensor_msgs/msg/CameraInfo",
    "ros.sensor_msgs.CameraInfo"
];
export function getCameraInfoOptions(topics: Immutable<Topic[]> | undefined): SelectOption[] {
    return getOptions(topics, CAMERAINFO_DATATYPES);
}


