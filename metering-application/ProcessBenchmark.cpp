#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <errno.h>
#include <string.h>
#include <iostream>
#include <fstream>
#include <ctime>
#include <vector>

#include "Rapl.h"

const char *HOME = std::getenv("HOME") ? std::getenv("HOME") : ".";
const char *file_path = strcat(const_cast<char *>(HOME), "/rapl.json");

double get_pkg_temp()
{
	FILE *fp = fopen("/sys/class/thermal/thermal_zone1/temp", "r");
	if (fp == NULL)
	{
		fprintf(stderr, "Could not read pkg_temp from file\n");
		exit(EXIT_FAILURE);
	}
	char line[10];
	fgets(line, 10, fp);

	return atof(line) / 1000.0;
}

double get_fan_freq()
{
	FILE *fp = fopen("/sys/class/hwmon/hwmon3/fan1_input", "r");
	if (fp == NULL)
	{
		fprintf(stderr, "Could not read fan_freq from file\n");
		exit(EXIT_FAILURE);
	}
	char line[10];
	fgets(line, 10, fp);

	return atof(line);
}

std::ostream &operator<<(std::ostream &os, std::vector<double> vector)
{
	os << "[";
	for (int i = 0; i < vector.size(); i++)
	{
		if (i > 0)
			os << ", ";
		os << vector[i];
	}
	os << "]";
	return os;
}

double double_vector_average(std::vector<double> vector)
{
	double total = 0;
	for (auto &&val : vector)
	{
		total += val;
	}
	return total / vector.size();
}

int main(int argc, char *argv[])
{
	size_t iterations = 1;

	char input_char;
	while ((input_char = getopt(argc, argv, "i:")) != -1)
	{
		switch (input_char)
		{
		case 'i':
			iterations = atoi(optarg);
			break;
		default:
			break;
		}
	}

	std::vector<double> energy_values, averagePower, time_value, dram_values, temp_values, fan_values = {};

	for (size_t i = 0; i < iterations; i++)
	{
		Rapl *rapl = new Rapl();
		int ms_pause = 100; // sample every 100ms

		pid_t child_pid = fork();
		if (child_pid >= 0)
		{ //fork successful
			if (child_pid == 0)
			{ // child process
				//printf("CHILD: child pid=%d\n", getpid());
				int exec_status = execvp(argv[3], argv + 3);
				if (exec_status)
				{
					std::cerr << "execv failed with error "
							  << errno << " "
							  << strerror(errno) << std::endl;
				}
			}
			else
			{ // parent process

				int status = 1;
				waitpid(child_pid, &status, WNOHANG);
				while (status)
				{

					usleep(ms_pause * 1000);

					// rapl sample
					rapl->sample();

					waitpid(child_pid, &status, WNOHANG);
				}
				wait(&status); /* wait for child to exit, and store its status */

				double temp = get_pkg_temp();
				double fan_freq = get_fan_freq();

				energy_values.push_back(rapl->pkg_total_energy());
				dram_values.push_back(rapl->dram_total_energy());
				time_value.push_back(rapl->total_time());
				temp_values.push_back(temp);
				fan_values.push_back(fan_freq);

				delete rapl;
			}
		}
		else
		{
			std::cerr << "fork failed" << std::endl;
			return 1;
		}
	}

	std::cout << std::endl
			  << "\tpkg_average:\t" << double_vector_average(energy_values) << " J" << std::endl
			  << "\tdram_average:\t" << double_vector_average(dram_values) << " J" << std::endl
			  << "\ttime_average:\t" << double_vector_average(time_value) << " s" << std::endl
			  << "\ttemp_average:\t" << double_vector_average(temp_values) << " C" << std::endl
			  << "\tfan_average:\t" << double_vector_average(fan_values) << " RPM" << std::endl;

	char arguments[255];

	for (int i = 4; i < argc; i++)
	{
		strcat(arguments, argv[i]);
		strcat(arguments, " ");
	}

	// convert now to string form
	time_t now = time(0);

	char time_string[40];
	strftime(time_string, 40, "%X %x", localtime(&now));

	std::ifstream infile(file_path, std::ios::in);
	std::string current_contents((std::istreambuf_iterator<char>(infile)), (std::istreambuf_iterator<char>()));
	infile.close();

	if (current_contents.empty())
	{
		current_contents = "[";
	}
	else
	{
		bool prepared_existing = false;
		while (!prepared_existing)
		{
			if (current_contents.back() == '}')
			{
				prepared_existing = true;
				current_contents.push_back(',');
			}
			else if (current_contents.back() == '[')
				prepared_existing = true;
			else
				current_contents.pop_back();
		}
	}

	std::ofstream outfile(file_path, std::ios::out | std::ios::trunc);
	outfile << current_contents
			<< "\n{\"timestamp\":\"" << time_string << "\","
			<< "\"command\":\"" << argv[3] << "\","
			<< "\"arguments\":\"" << arguments << "\","
			<< "\"iterations\":" << iterations << ","
			<< "\"cpu_temp_c\":" << temp_values << ","
			<< "\"fan_freq_rpm\":" << fan_values << ","
			<< "\"pkg\":" << energy_values << ","
			<< "\"dram\":" << dram_values << ","
			<< "\"time\":" << time_value << "}\n]";

	std::cout << "Written to file: " << file_path << std::endl;

	return 0;
}