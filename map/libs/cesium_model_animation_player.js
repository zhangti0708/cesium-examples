const Cesium = require('cesium/Cesium');

export const LOOP_TYPE = Object.freeze({"CLAMP":1, "LOOP":2});
export const PLAY_STATE = Object.freeze({"PLAY":1, "STOP":2, "PAUSE":3});

export class AnimationKey {
  constructor(time, value) {
    this.time = time;
    this.value = value;
  }
};

export class AnimationTrack {
  constructor() {
    this.translation_keys = [];
    this.rotation_keys = [];
    this.scale_keys = [];
  }
};

export class Animation {
  constructor(name) {
    this.name = name;
    this.duration = 0;
    this.tracks = {}; // a dictionary whose keys are node names
  }
};

export class AnimationSet {
  constructor(animations, nodes) {
    this.animations = animations;
    this.nodes = nodes;
  }
};

export class AnimationPlayer {
  constructor(animation_set, entity, fps) {
    this.loop_type = LOOP_TYPE.CLAMP;
    this.play_state = PLAY_STATE.STOP;
    this.animation_set = animation_set;
    this.entity = entity;
    if(this.animation_set.animations.length > 0) {
      this.current_animation = this.animation_set.animations[0];
    }
    else {
      this.current_animation = "";
    }

    // set initial node positions for Cesium entity
    let cesium_nodes = {};

    for(var node_name in this.animation_set.nodes) {
      if(typeof this.entity.model.nodeTransformations != "undefined" &&
         typeof this.entity.model.nodeTransformations[node_name] != "undefined"){
        cesium_nodes[node_name] = this.entity.model.nodeTransformations[node_name];
      } else {
        cesium_nodes[node_name] = {
          translation: new Cesium.Cartesian3(0, 0, 0),
          rotation: new Cesium.Cartesian4(0, 0, 0, 1),
          scale: new Cesium.Cartesian3(1, 1, 1)
        }
      }
    }

    this.entity.model.nodeTransformations = cesium_nodes;
    this.interval_id = -1;
    this.current_time = 0;
    this.speed = 1;
    this._frame_duration = 1.0/fps;
  }

  setAnimation(animation_name) {
    for(var i = 0; i < this.animation_set.animations.length; i++) {
      if(animation_name === this.animation_set.animations[i].name) {
        this.current_animation = this.animation_set.animations[i];
        return;
      }
    }
    console.error("Can't set current animation: " + animation_name + " does not exist");
  }

  setFPS(fps) {
    this._frame_duration = 1.0/fps;
  }

  play(animation_name) {
    if(typeof animation_name === 'undefined') {
      if(this.play_state === PLAY_STATE.PLAY) {
        return;
      } else if(this.play_state === PLAY_STATE.PAUSE) {
        this.play_state = PLAY_STATE.PLAY;
      } else if(this.play_state === PLAY_STATE.STOP) {
        this.play_state = PLAY_STATE.PLAY;
        this.interval_id = window.setInterval(() => this._update(), this._frame_duration * 1000);
      }
      return;
    }

    let animations = this.animation_set.animations;
    for(var i = 0; i < animations.length; i++) {
      if(animations[i].name === animation_name) {
        this.current_animation = animations[i];
        if(this.play_state === PLAY_STATE.PLAY) {
          return;
        } else if(this.play_state === PLAY_STATE.PAUSE) {
          this.play_state = PLAY_STATE.PLAY;
        } else if(this.play_state === PLAY_STATE.STOP) {
          this.play_state = PLAY_STATE.PLAY;
          this.interval_id = window.setInterval(() => this._update(), this._frame_duration * 1000);
        }
        return;
      }
    }
    console.error("Can't play animation: " + animation_name + " does not exist");
  }

  _clearUpdateInterval() {
    clearInterval(this.interval_id);
    this.interval_id = -1;
  }

  _update() {
    if(this.play_state === PLAY_STATE.PLAY)
      this.setTime(this.current_time + this._frame_duration * this.speed);
  }

  setPercent(percent) {
    if(percent < 0.0) {
      percent = 0.0;
    }
    else if(percent > 1.0) {
      percent = 1.0;
    }
    let time = this.current_animation.duration * percent;
    this.setTime(time);
  }

  setTime(current_time) {
    this.current_time = current_time;
    if(this.speed > 0) {
      if(this.current_time > this.current_animation.duration) {
        if(this.loop_type === LOOP_TYPE.CLAMP) {
          this.current_time = this.current_animation.duration;
        } else if(this.loop_type === LOOP_TYPE.LOOP) {
          this.current_time = 0;
        }
      }
    } else if(this.speed < 0) {
      if(this.current_time < 0) {
        if(this.loop_type === LOOP_TYPE.CLAMP) {
          this.current_time = 0;
        } else if(this.loop_type === LOOP_TYPE.LOOP) {
          this.current_time = this.current_animation.duration;
        }
      }
    }


    for(var track_name in this.current_animation.tracks) {
      let track = this.current_animation.tracks[track_name];
      let node = this.animation_set.nodes[track_name];
      let curr_trans_keys = this.getKeysAtTime(track.translation_keys, this.current_time);
      let curr_rot_keys = this.getKeysAtTime(track.rotation_keys, this.current_time);
      let curr_scale_keys = this.getKeysAtTime(track.scale_keys, this.current_time);

      //--------------------------
      // Translation
      //--------------------------
      if(typeof curr_trans_keys !== 'undefined' && curr_trans_keys.length > 0) {
        let orig_trans = node.translation;
        let invMat = node.inv_rotation_matrix;

        if(curr_trans_keys[0].time == curr_trans_keys[1].time) {
          let result = new Cesium.Cartesian3(curr_trans_keys[0].value[0] - orig_trans[0], curr_trans_keys[0].value[1] - orig_trans[1], curr_trans_keys[0].value[2] - orig_trans[2]);
          //get the result expressed in local node space
          Cesium.Matrix3.multiplyByVector(invMat, result, result);
          this.entity.model.nodeTransformations[track_name].translation = result;
        } else {
          let keyDelta = curr_trans_keys[1].time - curr_trans_keys[0].time;
          let timeDelta = this.current_time - curr_trans_keys[0].time;
          let t = timeDelta/keyDelta;
          let start = new Cesium.Cartesian3(curr_trans_keys[0].value[0], curr_trans_keys[0].value[1], curr_trans_keys[0].value[2]);
          let end = new Cesium.Cartesian3(curr_trans_keys[1].value[0], curr_trans_keys[1].value[1], curr_trans_keys[1].value[2]);

          //interpolate the translation keys
          let result = new Cesium.Cartesian3();
          Cesium.Cartesian3.lerp(start, end, t, result);

          //account for delta / relative offset from original translation
          result.x -= orig_trans[0];
          result.y -= orig_trans[1];
          result.z -= orig_trans[2];

          //get the result expressed in local node space
          Cesium.Matrix3.multiplyByVector(invMat, result, result);

          this.entity.model.nodeTransformations[track_name].translation = result;
        }
      }

      //--------------------------
      // Rotation
      //--------------------------
      if(typeof curr_rot_keys !== 'undefined' && curr_rot_keys.length > 0) {

        let orig_inv = node.inv_rotation;
        let invMat = node.inv_rotation_matrix;

        if(curr_rot_keys[0].time == curr_rot_keys[1].time) {
          let result = new Cesium.Quaternion(curr_rot_keys[0].value[0], curr_rot_keys[0].value[1], curr_rot_keys[0].value[2], curr_rot_keys[0].value[3]);

          //isolate the axis
          let resultAxis = new Cesium.Cartesian3(1,0,0);
          let resultAngle = Cesium.Quaternion.computeAngle(result);
          if(Math.abs(resultAngle) > Cesium.Math.EPSILON5)
            Cesium.Quaternion.computeAxis(result, resultAxis);

          //transform to local node space
          Cesium.Matrix3.multiplyByVector(invMat, resultAxis, resultAxis);

          //get the new quaternion expressed in local node space
          Cesium.Quaternion.fromAxisAngle(resultAxis, resultAngle, result);
          //calc the rotation delta/difference
          Cesium.Quaternion.multiply(result, orig_inv, result);
          this.entity.model.nodeTransformations[track_name].rotation = result;
        } else {
          let keyDelta = curr_rot_keys[1].time - curr_rot_keys[0].time;
          let timeDelta = this.current_time - curr_rot_keys[0].time;
          let t = timeDelta/keyDelta;
          let start = new Cesium.Quaternion(curr_rot_keys[0].value[0], curr_rot_keys[0].value[1], curr_rot_keys[0].value[2], curr_rot_keys[0].value[3]);
          let end = new Cesium.Quaternion(curr_rot_keys[1].value[0], curr_rot_keys[1].value[1], curr_rot_keys[1].value[2], curr_rot_keys[1].value[3]);

           //slerp the rotation keys
          let result = new Cesium.Quaternion();
          Cesium.Quaternion.slerp(start, end, t, result);

          //isolate the axis
          let resultAxis = new Cesium.Cartesian3(1,0,0);
          let resultAngle = Cesium.Quaternion.computeAngle(result);
          if(Math.abs(resultAngle) > Cesium.Math.EPSILON5)
            Cesium.Quaternion.computeAxis(result, resultAxis);

          //transform to local node space
          Cesium.Matrix3.multiplyByVector(invMat, resultAxis, resultAxis);

          //get the new quaternion expressed in local node space
          Cesium.Quaternion.fromAxisAngle(resultAxis, resultAngle, result);

          //calc the rotation delta/difference
          Cesium.Quaternion.multiply(result, orig_inv, result);

          this.entity.model.nodeTransformations[track_name].rotation = result;
        }
      }

      //--------------------------
      // Scale
      //--------------------------
      if(typeof curr_scale_keys !== 'undefined' && curr_scale_keys.length > 0) {
        let orig_scale = this.animation_set.nodes[track_name].scale;

        if(curr_scale_keys[0].time == curr_scale_keys[1].time) {
          let result = new Cesium.Cartesian3(curr_scale_keys[0].value[0] / orig_scale[0], curr_scale_keys[0].value[1] / orig_scale[1], curr_scale_keys[0].value[2] / orig_scale[2]);
          this.entity.model.nodeTransformations[track_name].scale = result;
        } else {
          let keyDelta = curr_scale_keys[1].time - curr_scale_keys[0].time;
          let timeDelta = this.current_time - curr_scale_keys[0].time;
          let t = timeDelta/keyDelta;
          let start = new Cesium.Cartesian3(curr_scale_keys[0].value[0], curr_scale_keys[0].value[1], curr_scale_keys[0].value[2]);
          let end = new Cesium.Cartesian3(curr_scale_keys[1].value[0], curr_scale_keys[1].value[1], curr_scale_keys[1].value[2]);
          let result = new Cesium.Cartesian3();
          Cesium.Cartesian3.lerp(start, end, t, result);

          //account for delta / relative offset from original scale
          result.x /= orig_scale[0];
          result.y /= orig_scale[1];
          result.z /= orig_scale[2];
          this.entity.model.nodeTransformations[track_name].scale = result;
        }
      }
    }
  }

  getKeysAtTime(keys, time) {
    let result = [];
    if(keys.length == 0)
      return result;

    //we need to return some value even if the first key for this track isn't reached quite yet
    if(keys[0].time > time) {
      result.push(keys[0]);
      result.push(keys[0]);
      return result;
    }

    //just clamp the last key if we are at the end
    if(time > keys[keys.length-1].time) {
      result.push(keys[keys.length-1]);
      result.push(keys[keys.length-1]);
      return result;
    }

    for(var i = 0; i < keys.length-1; i++) {
      if(keys[i].time <= time && keys[i+1].time >= time) {
        result.push(keys[i]);
        result.push(keys[i+1]);
        return result;
      }
    }
  }

  stop() {
    this.play_state = PLAY_STATE.STOP;
    this.current_time = 0;
    //reset the node transforms on the entity to the default pose
    let cesium_nodes = {};
    for(var node_name in this.animation_set.nodes) {
      cesium_nodes[node_name] = {
        translation: new Cesium.Cartesian3(0, 0, 0),
        rotation: new Cesium.Cartesian4(0, 0, 0, 1),
        scale: new Cesium.Cartesian3(1, 1, 1)
      }
    }
    this.entity.model.nodeTransformations = cesium_nodes;
    this._clearUpdateInterval();

  }

  pause() {
    //no need to pause if we are not playing
    if(this.play_state === PLAY_STATE.PLAY)
      this.play_state = PLAY_STATE.PAUSE;
    this._clearUpdateInterval();
  }
}

export class AnimationParser {
  static _readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsArrayBuffer(file);
    });
  }

  static _getResourceAsync(uri) {
    return new Promise((resolve, reject) => {
      var req = new Request(uri);

      fetch(req).then(function(response) {
        if (!response.ok) {
          reject(new Error(response.statusText));
        }
        return response;
      }).then(function(response) {
          resolve(response.arrayBuffer());
      });
    });
  }

  static parseAnimationNodesFromArrayBuffer(array_buffer) {
    // get the length of the JSON data starting at 12 byte offset according to gltf standard
    let dv = new DataView(array_buffer, 12, 4);
    // don't forget to set little-endian = true when parsing from data view (gltf standard!)
    let json_chunk_length = dv.getUint32(0, true);
    console.log("gltf JSON length: " + json_chunk_length + " bytes");

    // get the actual JSON data itself
    let json_data_chunk = array_buffer.slice(20, 20+json_chunk_length);
    let decoder = new TextDecoder('UTF-8');
    let json_text = decoder.decode(json_data_chunk);
    let gltf_json = JSON.parse(json_text);
    console.log("gltf JSON loaded successfully:");

    // store links to parent nodes
    for(var i = 0; i < gltf_json.nodes.length; i++) {
      if(typeof gltf_json.nodes[i].children != 'undefined') {
        for(var k = 0; k < gltf_json.nodes[i].children.length; k++) {
          gltf_json.nodes[gltf_json.nodes[i].children[k]].parent = gltf_json.nodes[i].name;
        }
      }
    }

    return gltf_json.nodes;
  }

  static parseAnimationsFromArrayBuffer(array_buffer) {
    let animations = [];

    // get the length of the JSON data starting at 12 byte offset according to gltf standard
    let dv = new DataView(array_buffer, 12, 4);
    // don't forget to set little-endian = true when parsing from data view (gltf tandard!)
    let json_chunk_length = dv.getUint32(0, true);
    console.log("gltf JSON length: " + json_chunk_length + " bytes");

    // get the actual JSON data itself
    let json_data_chunk = array_buffer.slice(20, 20+json_chunk_length);
    let decoder = new TextDecoder('UTF-8');
    let json_text = decoder.decode(json_data_chunk);
    let gltf_json = JSON.parse(json_text);
    console.log("gltf JSON loaded successfully:");
    console.log(gltf_json);

    // get the length of the gltf embedded binary data
    let bin_offset = 20+json_chunk_length;
    dv = new DataView(array_buffer, bin_offset, 4);
    let bin_chunk_length = dv.getUint32(0, true);
    console.log("gltf bin length: " + bin_chunk_length + " bytes");

    // get the actual binary data, we add 8 to get past the "type" and "chunk length" headers
    let bin_data_chunk = array_buffer.slice(bin_offset + 8, bin_offset + 8 + bin_chunk_length);

    //--------------------------------------------------
    // get and process all animations
    //--------------------------------------------------
    if(typeof gltf_json.animations === 'undefined')
      return [];
    for(var i = 0; i < gltf_json.animations.length; i++) {
      let anim_name = gltf_json.animations[i].name;
      if(typeof anim_name == 'undefined' || anim_name == "")
        anim_name = "animation_" + i;
      let curr_animation = new Animation(anim_name);
      console.log("processing animation: " + anim_name);

      for(var k = 0; k < gltf_json.animations[i].channels.length; k++) {
        let channel = gltf_json.animations[i].channels[k];

        // the following will be either "translation, rotation, or scale"
        let dof_type = channel.target.path;

        let node = gltf_json.nodes[channel.target.node];
        if(typeof node == 'undefined') {
          console.warn("node is undefined for channel " + k);
          continue;
        }

        let node_name = node.name;
        if(typeof node_name == 'undefined' || node.name == "") {
          node_name = "node_" + channel.target.node;
        }

        // add a new track to this animation for the node if it does not exist already
        if(typeof curr_animation.tracks[node_name] == 'undefined')
          curr_animation.tracks[node_name] = new AnimationTrack();

        let sampler = gltf_json.animations[i].samplers[channel.sampler];

        //--------------------------------------------------
        // get input accessor (keyframe times for this channel's sampler) and process the data for it
        //--------------------------------------------------
        let input = gltf_json.accessors[sampler.input];
        //console.log("min: " + input.min + " max: " + input.max);

        let input_accessor_byte_offset =  (typeof input.byteOffset == 'undefined' ? 0 : input.byteOffset);
        if(input.componentType != 5126)
          console.warn("input component type is not a float!");

        // each element (keyframe timestamp) is a 4 byte float
        let input_element_size = 4;

        //use the buffer view and accessor to offset into the binary buffer to retrieve our data
        let input_bufferView = gltf_json.bufferViews[input.bufferView];
        let input_accessor_data_offset = input_bufferView.byteOffset + input_accessor_byte_offset;
        let input_bin = bin_data_chunk.slice(input_accessor_data_offset, input_accessor_data_offset + input_element_size * input.count);
        let input_dv = new DataView(input_bin);

        // parse and store each timestamp out of the buffer
        let timestamps = [];
        for(var j = 0; j < input.count; j++) {
          let timestamp = input_dv.getFloat32(j*4, true);
          if(timestamp > curr_animation.duration) {
            curr_animation.duration = timestamp;
          }
          timestamps.push(timestamp);
        }

        //--------------------------------------------------
        // get output accessor (keyframe values for this channel's sampler) and process the data for it
        //--------------------------------------------------
        let output = gltf_json.accessors[sampler.output];

        let output_accessor_byte_offset =  (typeof output.byteOffset == 'undefined' ? 0 : output.byteOffset);

        // we only care about VEC3 and VEC4 since we are only dealing with rotation, scale, and translation,
        // and we are going to assume they are floating point (componentType = 5126 according to gltf spec)
        if(output.componentType != 5126)
          console.warn("output component type is not a float!");

        let output_component_count = (output.type == "VEC3" ? 3 : 4);
        // 4 byte floats in according to gltf spec
        let output_element_size = output_component_count * 4;

        //use the buffer view and accessor to offset into the binary buffer to retrieve our value data
        let output_bufferView = gltf_json.bufferViews[output.bufferView];
        let output_accessor_data_offset = output_bufferView.byteOffset + output_accessor_byte_offset;
        let output_bin = bin_data_chunk.slice(output_accessor_data_offset, output_accessor_data_offset + output_element_size * output.count);
        let output_dv = new DataView(output_bin);

        // parse and store each value
        let values = [];
        for(var j = 0; j < output.count * output_component_count; j += output_component_count) {
          let value = [];
          for(var l = 0; l < output_component_count; l++) {
            value.push(output_dv.getFloat32(j*4 + l*4, true));
          }
          values.push(value);
        }

        if(dof_type == "translation") {
          for(var j = 0; j < output.count; j++) {
            curr_animation.tracks[node_name].translation_keys.push(new AnimationKey(timestamps[j], values[j]));
          }
        } else if(dof_type == "rotation") {
          for(var j = 0; j < output.count; j++) {
            curr_animation.tracks[node_name].rotation_keys.push(new AnimationKey(timestamps[j], values[j]));
          }
        } else if(dof_type == "scale") {
          for(var j = 0; j < output.count; j++) {
            curr_animation.tracks[node_name].scale_keys.push(new AnimationKey(timestamps[j], values[j]));
          }
        }
      }
      animations.push(curr_animation);
    }
    return animations;
  }

  static async parseAnimationSetFromUri(glb_uri) {
    let array_buffer = await this._getResourceAsync(glb_uri);
    return this._parseAnimationSetFromArrayBuffer(array_buffer);
  }

  static async parseAnimationSetFromFile(glb_file) {
    let array_buffer = await this._readFileAsync(glb_file);
    return this._parseAnimationSetFromArrayBuffer(array_buffer);
  }

  static _parseAnimationSetFromArrayBuffer(array_buffer) {
    let animation_nodes = AnimationParser.parseAnimationNodesFromArrayBuffer(array_buffer);
    // convert nodes to dictionary format
    let nodes_dict = {};
    for(var i = 0; i < animation_nodes.length; i++) {
      nodes_dict[animation_nodes[i].name] = animation_nodes[i];

      //if the node defines its TRS info as a matrix, we need to capture that (see glTF 2.0 spec)
      if(typeof animation_nodes[i].matrix !== 'undefined') {
        let mat = new Cesium.Matrix4();
        Cesium.Matrix4.fromColumnMajorArray(animation_nodes[i].matrix, mat);
        nodes_dict[animation_nodes[i].name].matrix = mat;
      }

      //set default values for translation rotation and scale if they do not exist
      if(typeof nodes_dict[animation_nodes[i].name].translation === 'undefined')
        nodes_dict[animation_nodes[i].name].translation = [0,0,0];

      if(typeof nodes_dict[animation_nodes[i].name].rotation === 'undefined') {
        nodes_dict[animation_nodes[i].name].rotation = [0,0,0,1];
        nodes_dict[animation_nodes[i].name].inv_rotation_matrix = Cesium.Matrix3.IDENTITY;
        nodes_dict[animation_nodes[i].name].inv_rotation = new Cesium.Quaternion(0,0,0,1);
      }
      else {
        //compute and store the inverse rotation matrix and quaternion for future calculations
        let orig_rot = nodes_dict[animation_nodes[i].name].rotation;
        let orig_quat = new Cesium.Quaternion(orig_rot[0], orig_rot[1], orig_rot[2], orig_rot[3]);
        let orig_quat_inv = new Cesium.Quaternion();
        Cesium.Quaternion.inverse(orig_quat, orig_quat_inv);
        let invMat = new Cesium.Matrix3();
        Cesium.Matrix3.fromQuaternion(orig_quat_inv, invMat);
        nodes_dict[animation_nodes[i].name].inv_rotation_matrix = invMat;
        nodes_dict[animation_nodes[i].name].inv_rotation = orig_quat_inv;
      }

      if(typeof nodes_dict[animation_nodes[i].name].scale === 'undefined')
        nodes_dict[animation_nodes[i].name].scale = [0,0,0];
    }

    let animations = AnimationParser.parseAnimationsFromArrayBuffer(array_buffer);
    console.log(nodes_dict);
    return new AnimationSet(animations, nodes_dict);
  }
};
