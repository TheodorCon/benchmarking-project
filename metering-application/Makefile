CXX = g++
CXXFLAGS = -std=c++11 -g
LD = $(CXX)
LDFLAGS = -lm -lrt

all : ProcessBenchmark

ProcessBenchmark : ProcessBenchmark.o Rapl.o
	$(LD) $(LDFLAGS) -o $@ $^

ProcessBenchmark.o : ProcessBenchmark.cpp Rapl.h
	$(CXX) $(CXXFLAGS) -c -o $@ $<

Rapl.o : Rapl.cpp Rapl.h
	$(CXX) $(CXXFLAGS) -c -o $@ $< 

clean :
	rm -f *.o 
	rm -f ProcessBenchmark 
