import math
import numpy as np
from scipy import stats

class DataCollector:
    def __init__(self, name, unit, sigfig = None):
        self.name = name
        self.unit = unit
        self.collection = np.array([])
        self.summary = None
        self.sigfig = sigfig

    def insert(self, data):
        self.collection = np.append(self.collection, data)

    def generate_summary(self):
        if len(self.collection) == 0:
            print('\t[WARNING] ', self.name, 'unable to compute other metrics because the array is empty')
            self.summary = {}
        else:
            mean = np.mean(self.collection)
            std = np.std(self.collection)
            CI_scale = std / math.sqrt(len(self.collection))

            self.summary = {
                "total" : np.sum(self.collection),
                "minimum" : np.min(self.collection),
                "maximum" : np.max(self.collection),
                "average" : mean,
                "standard deviation" : std,
                "median" : np.percentile(self.collection, 50),
                "P90" : np.percentile(self.collection, 90),
                "P95" : np.percentile(self.collection, 95),
                "P99" : np.percentile(self.collection, 99),
                "90% confidence interval" : list(stats.norm.interval(0.90, loc=mean, scale=CI_scale)),
                "95% confidence interval" : list(stats.norm.interval(0.95, loc=mean, scale=CI_scale)),
                "99% confidence interval" : list(stats.norm.interval(0.99, loc=mean, scale=CI_scale)),
            }

        if self.sigfig is not None:
            for key in list(self.summary.keys()):
                if type(self.summary[key]) is list:
                    for i in range(len(self.summary[key])):
                        self.summary[key][i] = round(self.summary[key][i], self.sigfig)
                else:
                    self.summary[key] = round(self.summary[key], self.sigfig)


    def print_summary(self):
        print('< summary for {} ( unit : {} ) >'.format(self.name, self.unit))
        print('\tlength : ', len(self.collection))
        if len(self.collection) == 0:
            print('\tunable to compute other metrics because the array is empty')
            return
        if self.summary is None:
            self.generate_summary()
        for key, val in self.summary.items():
            print('\t', key, ' - ', val)

    def get_summary(self):
        if self.summary is None:
            self.generate_summary()
        return self.summary

    def get_len(self):
        return len(self.collection)

    def combine(self, data_collector):
        self.collection = np.add(self.collection, data_collector.collection);

    def get_collection(self):
        return self.collection

    def set_collection(self, collection):
        self.collection = collection
