from keras.models import *
from keras.layers import *
import keras
import os
import numpy as np
import time
import datetime
import logging

from sklearn.model_selection import train_test_split
from argparse import ArgumentParser


# Training Script of RES8_NARROW network for honkling
# usage :
#    python training.py -d sample_data -c go yes stop no


def print_log(level, msg):
    if (level == 'info'):
        print msg
        logging.info(msg)
    if (level == 'debug'):
        logging.debug(msg)

def define_layers(config) :
    layers = {}

    layers['conv0'] = Conv2D(
        filters=config['n_feature_maps'],
        kernel_size=config['conv_size'],
        strides=config['conv_stride'],
        padding='same',
        use_bias=False,
        activation='relu',
        kernel_initializer='glorot_uniform',
        bias_initializer=keras.initializers.zeros(),
        name = 'conv0'
    )

    layers['pool'] = AveragePooling2D(
        pool_size=config['res_pool'],
        strides=None,
        data_format=None,
        name = 'pool')

    for i in range(config['n_layers']):
        conv = Conv2D(
            filters=config['n_feature_maps'],
            kernel_size=config['conv_size'],
            strides=config['conv_stride'],
            padding='same',
            use_bias=False,
            activation='relu',
            kernel_initializer='glorot_uniform',
            bias_initializer=keras.initializers.zeros(),
            name = "conv{}".format(i + 1)
        )
        layers.update({"conv{}".format(i + 1) : conv})

    for i in range(config['n_layers'] + 1):
        bn = BatchNormalization(
            momentum=0.1,
            epsilon=0.00001,
            gamma_initializer=keras.initializers.ones(),
            beta_initializer=keras.initializers.zeros(),
            name="bn{}".format(i)
        )
        layers.update({"bn{}".format(i) : bn})

    layers['dense'] = Dense(
        config['n_labels'],
        activation='linear', #None
        use_bias=True,
        kernel_initializer='glorot_uniform',
        bias_initializer='zeros',
        kernel_regularizer=None,
        bias_regularizer=None,
        activity_regularizer=None,
        kernel_constraint=None,
        bias_constraint=None,
        name="dense"
    )

    layers['add'] = Add();

    layers['globalAvgPool'] = GlobalAveragePooling2D();

    layers['output'] = Softmax();

    print_log('debug', '< layers definitions >')

    for name, layer in layers.iteritems():
        print_log('debug', name +' = ' +str(layer.get_config()))

    return layers


def compile_model(config, layers):
    input = Input(shape=config['input_shape'], name='input')
    x = input;
    x = layers['bn0'](x)

    for i in range(config['n_layers'] + 1):
        y = layers["conv{}".format(i)](x)
        if i == 0:
            if 'pool' in layers:
                y = layers['pool'](y)
            old_x = y

        if i > 0 and i % 2 == 0:
            x = layers['add']([y, old_x])
            old_x = x
        else:
            x = y

        if i > 0:
            x = layers["bn{}".format(i)](x)

    x = layers['globalAvgPool'](x)

    x = layers['dense'](x)

    output = layers['output'](x)

    model = Model(inputs=input, outputs=output)

    print_log('info', '< model summary >')

    model.summary(print_fn=lambda x: print_log('info', x))

    return model


class ProgressChecker(keras.callbacks.Callback):
    def __init__(self, freq, num_epochs):
        self.frequency = freq
        self.num_epochs = num_epochs
        self.start_time = time.time()
        self.timestamp = [self.start_time]
        self.elapsed_time = []
        print_log('info', 'training start time = ' + datetime.datetime.fromtimestamp(self.start_time).strftime('%Y-%m-%d %H:%M:%S'))
	self.loss = []
	self.categorical_accuracy = []
	self.val_loss = []
	self.val_categorical_accuracy = []

    def on_epoch_end(self, epoch, logs={}):
        if epoch % self.frequency == 0 and epoch != 0:
            self.timestamp.append(time.time())
            elapsed_time = self.timestamp[-1] - self.timestamp[-2]
            self.elapsed_time.append(elapsed_time)
            print_log('info', 'epoch ' + str(epoch) + ' / ' + str(self.num_epochs) + ' : ' + time.strftime("%H:%M:%S", time.gmtime(elapsed_time)))

            remaing_epoch = self.num_epochs - epoch
            remaining_time = remaing_epoch / self.frequency * elapsed_time
            print_log('info', 'expected remaining time : '+ time.strftime("%H:%M:%S", time.gmtime(remaining_time)))

            print_log('info', 'loss = ' + str(logs['loss']))
            print_log('info', 'categorical_accuracy = ' + str(logs['categorical_accuracy']))
            print_log('info', 'val_loss = ' + str(logs['val_loss']))
            print_log('info', 'val_categorical_accuracy = ' + str(logs['val_categorical_accuracy']))

            self.loss.append(logs['loss'])
            self.categorical_accuracy.append(logs['categorical_accuracy'])
            self.val_loss.append(logs['val_loss'])
            self.val_categorical_accuracy.append(logs['val_categorical_accuracy'])

    def on_train_end(self, logs={}):
            self.finish_time = time.time()
            self.timestamp.append(self.finish_time)
            elapsed_time = self.timestamp[-1] - self.timestamp[-2]
            self.elapsed_time.append(elapsed_time)
            print_log('info', 'epoch ' + str(self.num_epochs) + ' / ' + str(self.num_epochs) + ' : ' + time.strftime("%H:%M:%S", time.gmtime(elapsed_time)))

            print_log('info', 'training finish time = ' + datetime.datetime.fromtimestamp(self.finish_time).strftime('%Y-%m-%d %H:%M:%S'))


def prepare_dataset(command_list, data_dir, input_shape):
    data_list = os.listdir(data_dir)

    print_log('info', 'command list = ' + str(command_list))
    print_log('info', 'data dir = ' + data_dir)

    X = []
    Y = []

    for subdir, dirs, files in os.walk(data_dir):
        for file in files:
            if file.startswith('.'):
                continue
            target_command = "unknown"
            for index, command in enumerate(command_list):
                if file.startswith(command):
                    target_command = command
                    break

            original_data = np.loadtxt(os.path.join(subdir, file))
	    if len(original_data) < 4000:
                total_pad = 4000 - len(original_data);
	        left = np.random.randint(total_pad);
                data = np.pad(original_data, (left, total_pad-left), 'constant')
            else:
                data = original_data;
            data = data.reshape(input_shape)
            X.append(data)
            Y.append(index)

    return X, Y


def generate_weights_json(command_list, layers, model_name, file_name):
    file = open('../weights/' + model_name + '/' + file_name +'.js', 'w')

    file.write('const weights = {\n\t' + model_name + ' : {\n')

    file.write('\t\t commands : [')
    for index, command in enumerate(command_list):
        file.write('"'+str(command)+'"')
        if (index != len(command_list) - 1):
            file.write(', ')
    file.write('], \n')

    for key, value in layers.iteritems():
        weights = np.array(value.get_weights())

        for i in range(len(weights)):
            flattened = weights[i].flatten()
            if (weights.shape[0] != 0):
                file.write('\t\t ' + key + '_' + str(i) + ' : [')
                for index, weight in enumerate(flattened):
                    file.write(str(weight))
                    if (index != len(flattened) - 1):
                        file.write(', ')

                file.write('], \n')

    file.write('\t}\n}\n')
    file.close()


def main():
    parser = ArgumentParser()
    parser.add_argument("-d", "--data_dir", dest="data_dir", type=str, required=True)
    parser.add_argument('-c', '--command_list', nargs='+', dest="command_list", type=str, required=True)
    parser.add_argument('-e', '--num_epochs', dest="num_epochs", type=int, default=500)
    parser.add_argument('-f', '--training_log_frequency', dest="training_log_frequency", type=int, default=50)
    parser.add_argument('-l', '--log_file', dest="log_file")
    parser.add_argument('-b', '--batch_size', dest="batch_size", type=int, default=250)
    parser.add_argument('-lr', '--learning_rate', dest="learning_rate", type=float, default=0.01)
    parser.add_argument('-ts', '--test_size', dest="test_size", type=float, default=0.10)

    args = parser.parse_args()

    args.num_command = len(args.command_list)
    args.model_name = 'RES8_NARROW'

    if args.log_file is None:
        args.log_file = args.model_name+'_' + str(args.command_list) + '_' + str(args.learning_rate) + '_' + str(args.num_epochs) +'.log'

    logging.basicConfig(filename=args.log_file, level=logging.DEBUG, format="%(asctime)s - %(levelname)s : %(message)s")

    print_log('info', 'model_name = ' + str(args.model_name))

    print_log('info', 'args = ' + str(args))

    # config for RES8_NARROW
    layer_config = dict(
        input_shape=(100,40,1,),
        conv_size=(3,3),
        conv_stride=(1,1),
        n_labels=args.num_command,
        n_layers=6,
        n_feature_maps=19,
        res_pool=(4, 3),
        use_dilation=False)

    print_log('info', 'layer configuration = ' + str(layer_config))

    # model definition

    layers = define_layers(layer_config)

    model = compile_model(layer_config, layers)

    # optimizer = keras.optimizers.SGD(lr=0.01, decay=1e-5, momentum=0.9, nesterov=True)
    optimizer = keras.optimizers.SGD(
        lr=args.learning_rate,
        decay=1e-5,
        momentum=0.9,
        nesterov=False
    )

    model.compile(
        loss='categorical_crossentropy',
        optimizer=optimizer,
        metrics=['categorical_accuracy']
    )

    print_log('info', 'model config = ' + str(optimizer.get_config()))
    print_log('debug', 'model config = ' + str(model.get_config()))

    # data preparation

    X, Y = prepare_dataset(args.command_list, args.data_dir + '/', layer_config['input_shape'])

    print_log('info', 'total data size = ' + str(len(X)))

    X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=args.test_size, random_state=1)
    Y_train = keras.utils.to_categorical(Y_train, num_classes=args.num_command)
    Y_test = keras.utils.to_categorical(Y_test, num_classes=args.num_command)

    X_train = np.array(X_train)
    X_test = np.array(X_test)

    print_log('info', 'train X shape = ' + str(X_train.shape))
    print_log('info', 'train Y shape = ' + str(Y_train.shape))
    print_log('info', 'test X shape = ' + str(X_test.shape))
    print_log('info', 'test Y shape = ' + str(Y_test.shape))

    # model training

    print_log('info', 'training model with learning rate = ' + str(args.learning_rate) + ', num epochs = ' + str(args.num_epochs) + ', batch size = ' + str(args.batch_size))

    process_checker = ProgressChecker(args.training_log_frequency, args.num_epochs)

    training_result = model.fit(
        X_train,
        Y_train,
        validation_data=(X_test, Y_test),
        epochs=args.num_epochs,
        batch_size=args.batch_size,
        callbacks=[ process_checker ],
        verbose=0)

    process_checker.loss.append(training_result.history['loss'][-1])
    process_checker.categorical_accuracy.append(training_result.history['categorical_accuracy'][-1])
    process_checker.val_loss.append(training_result.history['val_loss'][-1])
    process_checker.val_categorical_accuracy.append(training_result.history['val_categorical_accuracy'][-1])

    train_loss = process_checker.loss
    val_loss = process_checker.val_loss
    train_acc = process_checker.categorical_accuracy
    val_acc = process_checker.val_categorical_accuracy

    print_log('info', 'train_loss = ' + str(train_loss))
    print_log('info', 'train_acc = ' + str(train_acc))
    print_log('info', 'val_loss = ' + str(val_loss))
    print_log('info', 'val_acc = ' + str(val_acc))

    # graphing loss and accuracy
    #
    # xc = range(training_config['num_epochs'])
    #
    # plt.figure()
    # plt.plot(xc, train_loss, label="train_loss")
    # plt.plot(xc, train_acc, label="train_acc")
    # plt.plot(xc, val_loss, label="val_loss")
    # plt.plot(xc, val_acc, label="val_acc")
    # plt.legend()

    generate_weights_json(args.command_list, layers, args.model_name, args.log_file[:-4])

    print_log('info', 'training completed')

if __name__ == "__main__":
    main()
