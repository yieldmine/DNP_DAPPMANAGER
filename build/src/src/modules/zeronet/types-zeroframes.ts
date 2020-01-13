/**
 * Info about a single ZeroNet site.
 * Is is basically a dump of content.json + site settings
 * It does not include the list of files
 */
export interface ZeronetSiteInfo {
  auth_key: string; // "4b08f27e843ae5a0ee071501df7df24e011e81d97adc423c32413f1338d9218d";
  auth_address: string; // "196ZWmewQ7EQXRcNbtAkJPYX5aKPX6VLK1";
  cert_user_id: string | null;
  address: string; // "1BQNYotj7yJQ4GeWLotZ1BjVwnuTeZqnkN";
  address_short: string; // "1BQNYo..qnkN";
  settings: {
    own: boolean; // false;
    serving: boolean; // true;
    permissions: any[]; // ???? [];
    cache: {};
    size_files_optional: number; // 0;
    added: number; // 1578823500;
    downloaded: number; // 1578823500;
    optional_downloaded: number; // 0;
    size_optional: number; // 0;
    size: number; // 5887;
    ajax_key: string; // "e9955d8f41aca976f601ada1446fa6853d4e696cda679caa65830e15ac5382dc";
    bytes_recv: number; // 5887;
    modified: number; // 1578823432;
    peers: number; // 1;
  };
  content_updated: number; // 1578823500.774118;
  bad_files: number; // 0;
  size_limit: number; // 10;
  next_size_limit: number; // 10;
  peers: number; // 2;
  started_task_num: number; // 0;
  tasks: number; // 0;
  workers: number; // 0;
  content: {
    address: string; // "1BQNYotj7yJQ4GeWLotZ1BjVwnuTeZqnkN";
    address_index: number; // 26963364;
    "background-color": string; // "#FFF";
    clone_root: string; // "template-new";
    cloned_from: string; // "1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D";
    description: string; // "";
    // The ZeroNet WebsocketUI only sends the file count
    // content["files"] = len(content.get("files", {}))
    files: number; // 2;
    ignore: string; // "";
    inner_path: string; // "content.json";
    modified: number; // 1578823432;
    postmessage_nonce_security: boolean; // true;
    signs_required: number; // 1;
    title: string; // "my new site";
    translate: string; // ["js/all.js"];
    zeronet_version: string; // "0.7.1";
    files_optional: number; // 0;
    includes: number; // 0;
  };
  feed_follow_num: any | null; // ????
}

/**
 * ZeroNet root file in each site
 */
export interface ZeronetContentJson {
  address: string; // "1B27wUJFvVVxUEAC9LaCWoJm9svy8k1wUk";
  address_index: number; // 204481;
  "background-color": string; // "#FFF";
  clone_root: string; ///"template-new";
  cloned_from: string; // "1HeLLo4uzjaLetFx6NH3PMwFP3qbRbTf3D";
  description: string; // "";
  files: {
    // fileName = "index.html"
    [fileName: string]: {
      sha512: string; // "66d08e6b9cb9615da488d43b019c91a5f18c8856a291ec589f4f42ee84df2441";
      size: number; // 386;
    };
  };
  ignore: string; // "";
  inner_path: string; // "content.json";
  modified: number; // 1577549593;
  postmessage_nonce_security: boolean; // true;
  signers_sign: string; // "G1Q4q/SzypDVi++SHZDeMNqfIkwXqnMOqd+P9EXySB1ASeDZtmefwv0/Gd0W4M13Hi4ubyDYa2aBzfSIwMnBK0o=";
  signs: {
    // signerAddress = "1B27wUJFvVVxUEAC9LaCWoJm9svy8k1wUk"
    [signerAddress: string]: string; // "G2+qvElG4DBNvrm4hfDC9LfDEsu8ZvgKQYH5JWY+7e9HHwkDmEFzWeP0Qjxct9++D5x6XFh76PdCiYgzasQ8buM=";
  };
  signs_required: number; // 1;
  title: string; // "my new site";
  translate: string[]; // ["js/all.js"];
  zeronet_version: string; // "0.7.1";
}

/**
 * Status of the ZeroNet daemon
 */
export interface ZeronetServerInfo {
  ip_external: boolean; // true;
  port_opened: {
    ipv4: boolean;
    ipv6: boolean;
  };
  platform: string; // "linux";
  fileserver_ip: string; // "*";
  fileserver_port: number; // 26552;
  tor_enabled: boolean; // true;
  tor_status: string; // "OK (1 onions running)";
  tor_has_meek_bridges: boolean;
  tor_use_bridges: boolean;
  ui_ip: string; // "*";
  ui_port: number; // 80;
  version: string; // "0.7.1";
  rev: number; // 4372;
  timecorrection: number; // -0.6432757377624512;
  language: string; // "en";
  debug: boolean;
  offline: boolean;
  plugins: string[];
  // plugins = [
  //   "AnnounceBitTorrent",
  //   "AnnounceLocal",
  //   "AnnounceShare",
  //   "AnnounceZero",
  //   "Benchmark",
  //   "Bigfile",
  //   "Chart",
  //   "ContentFilter",
  //   "Cors",
  //   "CryptMessage",
  //   "FilePack",
  //   "MergerSite",
  //   "Newsfeed",
  //   "OptionalManager",
  //   "PeerDb",
  //   "Sidebar",
  //   "Stats",
  //   "TranslateSite",
  //   "Trayicon",
  //   "UiConfig",
  //   "UiPluginManager",
  //   "Zeroname"
  // ];
  plugins_rev: {};
  user_settings: {};
}
