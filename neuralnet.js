var input_size = 9;
var hidden_size = 9;
var num_hidden_layers = 9;
var output_size = 9;

function nonlinearFunc(a) {
  return Math.tanh(a);
}

function nonlinearDerivative(a) {
  return 1 - (Math.tanh(a) * Math.tanh(a));
}

function neuron(in_size) {
  var neuronObj = {};
  neuronObj.weights = [];
  neuronObj.output = 0;
  for(var i = 0; i < in_size; i++) {
    neuronObj.weights[i] = Math.random() / hidden_size;
  }

  neuronObj.update = function(ins) {
    this.output = 0;
    for(var i = 0; i < this.weights.size; i++) {
      this.output += this.weights[i] * ins[i];
    }
    this.output = nonlinearFunc(this.output);
  };
  return neuronObj;
}

function neuralLayer(size, in_size) {
  var layer = {};
  layer.neurons = [];
  for(var i = 0; i < size; i++) {
    layer.neurons[i] = neuron(in_size);
  }

  layer.update = function(inputs) {
    for(var i = 0; i < this.neurons.size; i++) {
      this.neurons[i].update(inputs);
    }
  };

  layer.get_outputs = function() {
    var outputs = [];
    for(var i = 0; i < this.neurons.size; i++) {
      outputs[i] = this.neurons[i].output;
    }
    return outputs;
  };

  return layer;
}

exports.neuralNetwork = function() {
  var netObj = {};
  netObj.input_layer = [];
  netObj.hidden_layers = [];
  netObj.output_layer = neuralLayer(output_size, hidden_size);

  netObj.hidden_layers[0] = neuralLayer(hidden_size, input_size);
  for(var i = 1; i < num_hidden_layers; i++) {
    netObj.hidden_layers[i] = neuralLayer(hidden_size, hidden_size);
  }

  netObj.update = function(inputs) {
    this.input_layer = inputs;
    for(var i = 0; i < num_hidden_layers; i++) {
      this.hidden_layers[i].update(inputs);
      inputs = this.hidden_layers[i].get_outputs();
    }
    this.output_layer.update(inputs);
  };

  netObj.backpropagate = function(targets) {
    var output_error = [];
    var hidden_error = new Array(num_hidden_layers);

    // Output Error
    for(var i = 0; i < targets.length; i++) {
      var out = this.output_layer[i].output;
      output_error[i] = (targets[i] - out) * (1 - out) * out;
    }
    // Hidden Error
    var higher_layer = this.output_layer;
    var higher_error = output_error;
    for(var i = num_hidden_layers - 1; i >= 0; i--) {
      hidden_error[i] = [];
      for(var j = 0; j < hidden_size; j++) {
        hidden_error[i][j] = 0;
        for(var k = 0; k < higher_layer.neurons.length; k++) {
          var weight = higher_layer.neurons[k].weights[j];
          hidden_error[i][j] += weight * higher_error[k];
        }
      }
      higher_layer = this.hidden_layers[i];
      higher_error = hidden_error[i];
    }

    // Update hidden weights
    for(var i = 0; i < num_hidden_layers; i++) {
      for(var j = 0; j < hidden_size; j++) {
        for(var k = 0; k < this.hidden_layers[i].neurons[j].weights.length; k++) {
          var out = this.hidden_layers[i].neurons[j].output;
          this.hidden_layers.neurons[j].weights[k] += hidden_errors[i][j] * nonlinearDerivative(out);
        }
      }
    }
    // Update output weights
    for(var i = 0; i < output_size; i++) {
      for(var j = 0; j < this.output_layer.neurons[i].weights.length; j++) {
        var out = this.output_layer.neurons[i].output;
        this.output_layer.neurons[i].weights[j] += output_error[i] * nonlinearDerivative(out);
      }
    }
  };

  return netObj;
}
